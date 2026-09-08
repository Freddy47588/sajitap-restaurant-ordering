alter table public.orders
add column tracking_token text not null unique default encode(gen_random_bytes(24), 'hex');

create or replace function public.create_customer_order(
  p_restaurant_slug text,
  p_table_number text,
  p_customer_name text,
  p_customer_note text,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_restaurant_id uuid;
  v_table_id uuid;
  v_order_id uuid;
  v_order_code text;
  v_tracking_token text;
  v_item jsonb;
  v_menu public.menu_items%rowtype;
  v_quantity integer;
  v_selected_options jsonb;
  v_option_total integer;
  v_unit_price integer;
  v_item_subtotal integer;
  v_total integer := 0;
  v_order_item_id uuid;
  v_option_id uuid;
  v_group record;
  v_selected_count integer;
  v_estimated_minutes integer := 0;
begin
  if p_customer_name is null or char_length(btrim(p_customer_name)) not between 1 and 80 then
    raise exception using errcode = '22023', message = 'Nama pemesan tidak valid.';
  end if;
  if p_customer_note is not null and char_length(p_customer_note) > 500 then
    raise exception using errcode = '22023', message = 'Catatan pesanan terlalu panjang.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception using errcode = '22023', message = 'Daftar pesanan tidak valid.';
  end if;

  select id into v_restaurant_id
  from public.restaurants
  where slug = p_restaurant_slug;
  if v_restaurant_id is null then
    raise exception using errcode = 'P0002', message = 'Restoran tidak ditemukan.';
  end if;

  select id into v_table_id
  from public.restaurant_tables
  where restaurant_id = v_restaurant_id and table_number = btrim(p_table_number) and active;
  if v_table_id is null then
    raise exception using errcode = '22023', message = 'Meja tidak tersedia.';
  end if;

  loop
    v_order_code := 'ST-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    exit when not exists (select 1 from public.orders where order_code = v_order_code);
  end loop;

  insert into public.orders (restaurant_id, table_id, order_code, customer_name, customer_note, subtotal, total)
  values (v_restaurant_id, v_table_id, v_order_code, btrim(p_customer_name), nullif(btrim(p_customer_note), ''), 0, 0)
  returning id, tracking_token into v_order_id, v_tracking_token;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_quantity := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception using errcode = '22023', message = 'Jumlah item tidak valid.';
    end;
    if v_quantity is null or v_quantity not between 1 and 50 then
      raise exception using errcode = '22023', message = 'Jumlah item harus antara 1 dan 50.';
    end if;
    if char_length(coalesce(v_item ->> 'note', '')) > 500 then
      raise exception using errcode = '22023', message = 'Catatan item terlalu panjang.';
    end if;

    select * into v_menu from public.menu_items
    where restaurant_id = v_restaurant_id and slug = v_item ->> 'menu_slug' and available;
    if not found then
      raise exception using errcode = '22023', message = 'Salah satu menu tidak tersedia.';
    end if;

    v_selected_options := coalesce(v_item -> 'option_ids', '[]'::jsonb);
    if jsonb_typeof(v_selected_options) <> 'array' then
      raise exception using errcode = '22023', message = 'Pilihan menu tidak valid.';
    end if;
    if jsonb_array_length(v_selected_options) <> (
      select count(distinct value) from jsonb_array_elements_text(v_selected_options)
    ) then
      raise exception using errcode = '22023', message = 'Pilihan menu berulang.';
    end if;

    for v_group in
      select id, name, min_select, max_select from public.menu_option_groups where menu_item_id = v_menu.id
    loop
      select count(*) into v_selected_count
      from public.menu_options option
      where option.option_group_id = v_group.id
        and option.available
        and option.id::text in (select value from jsonb_array_elements_text(v_selected_options));
      if v_selected_count < v_group.min_select or v_selected_count > v_group.max_select then
        raise exception using errcode = '22023', message = 'Pilihan untuk ' || v_group.name || ' tidak valid.';
      end if;
    end loop;

    if exists (
      select 1 from jsonb_array_elements_text(v_selected_options) selected(value)
      where not exists (
        select 1 from public.menu_options option
        join public.menu_option_groups option_group on option_group.id = option.option_group_id
        where option.id::text = selected.value and option.available and option_group.menu_item_id = v_menu.id
      )
    ) then
      raise exception using errcode = '22023', message = 'Pilihan tambahan tidak tersedia.';
    end if;

    select coalesce(sum(option.price_delta), 0) into v_option_total
    from public.menu_options option
    where option.id::text in (select value from jsonb_array_elements_text(v_selected_options));
    v_unit_price := v_menu.price + v_option_total;
    v_item_subtotal := v_unit_price * v_quantity;
    v_total := v_total + v_item_subtotal;
    v_estimated_minutes := greatest(v_estimated_minutes, coalesce((regexp_match(v_menu.preparation_time, '([0-9]+)[^0-9]*$'))[1]::integer, 0));

    insert into public.order_items (order_id, menu_item_id, menu_item_name_snapshot, unit_price, quantity, note, subtotal)
    values (v_order_id, v_menu.id, v_menu.name, v_unit_price, v_quantity, nullif(btrim(v_item ->> 'note'), ''), v_item_subtotal)
    returning id into v_order_item_id;

    for v_option_id in
      select value::uuid from jsonb_array_elements_text(v_selected_options)
    loop
      insert into public.order_item_options (order_item_id, menu_option_id, option_name_snapshot, price_delta)
      select v_order_item_id, id, name, price_delta from public.menu_options where id = v_option_id;
    end loop;
  end loop;

  update public.orders
  set subtotal = v_total, total = v_total,
      estimated_preparation_time = case when v_estimated_minutes > 0 then greatest(5, v_estimated_minutes - 5) || '–' || v_estimated_minutes || ' menit' else '10–15 menit' end
  where id = v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'order_code', v_order_code,
    'tracking_token', v_tracking_token,
    'table_number', p_table_number,
    'customer_name', btrim(p_customer_name),
    'total', v_total,
    'status', 'pending',
    'item_count', (select sum((item.value ->> 'quantity')::integer) from jsonb_array_elements(p_items) item),
    'preparation_time', case when v_estimated_minutes > 0 then greatest(5, v_estimated_minutes - 5) || '–' || v_estimated_minutes || ' menit' else '10–15 menit' end,
    'created_at', now()
  );
end;
$$;

revoke all on function public.create_customer_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_customer_order(text, text, text, text, jsonb) to anon, authenticated;

-- Stable public table routes need only customer-facing fields. Internal IDs and
-- QR rotation tokens remain available to authenticated staff, not anonymous clients.
revoke select on public.restaurant_tables from anon;
grant select (table_number, label, active) on public.restaurant_tables to anon;
