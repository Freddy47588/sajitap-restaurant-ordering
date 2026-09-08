-- Public demo staff are ordinary tenant-scoped profiles. Demo operators retain
-- their role workflows, while a demo administrator is read-only at the database
-- boundary so published credentials cannot change restaurant configuration.
alter table public.profiles
add column is_demo boolean not null default false;

create or replace function public.current_staff_is_demo() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(is_demo, false) from public.profiles where id = auth.uid() $$;

revoke all on function public.current_staff_is_demo() from public;
grant execute on function public.current_staff_is_demo() to authenticated;

drop policy if exists "admin manages tables" on public.restaurant_tables;
create policy "admin manages tables" on public.restaurant_tables for all to authenticated
using (
  restaurant_id = public.current_staff_restaurant_id()
  and public.current_staff_role() = 'admin'
  and not public.current_staff_is_demo()
)
with check (
  restaurant_id = public.current_staff_restaurant_id()
  and public.current_staff_role() = 'admin'
  and not public.current_staff_is_demo()
);

drop policy if exists "admin manages categories" on public.categories;
create policy "admin manages categories" on public.categories for all to authenticated
using (
  restaurant_id = public.current_staff_restaurant_id()
  and public.current_staff_role() = 'admin'
  and not public.current_staff_is_demo()
)
with check (
  restaurant_id = public.current_staff_restaurant_id()
  and public.current_staff_role() = 'admin'
  and not public.current_staff_is_demo()
);

drop policy if exists "admin manages menu" on public.menu_items;
create policy "admin manages menu" on public.menu_items for all to authenticated
using (
  restaurant_id = public.current_staff_restaurant_id()
  and public.current_staff_role() = 'admin'
  and not public.current_staff_is_demo()
)
with check (
  restaurant_id = public.current_staff_restaurant_id()
  and public.current_staff_role() = 'admin'
  and not public.current_staff_is_demo()
);

drop policy if exists "admin manages option groups" on public.menu_option_groups;
create policy "admin manages option groups" on public.menu_option_groups for all to authenticated
using (
  exists (
    select 1 from public.menu_items item
    where item.id = menu_item_id
      and item.restaurant_id = public.current_staff_restaurant_id()
      and public.current_staff_role() = 'admin'
      and not public.current_staff_is_demo()
  )
)
with check (
  exists (
    select 1 from public.menu_items item
    where item.id = menu_item_id
      and item.restaurant_id = public.current_staff_restaurant_id()
      and public.current_staff_role() = 'admin'
      and not public.current_staff_is_demo()
  )
);

drop policy if exists "admin manages options" on public.menu_options;
create policy "admin manages options" on public.menu_options for all to authenticated
using (
  exists (
    select 1
    from public.menu_option_groups option_group
    join public.menu_items item on item.id = option_group.menu_item_id
    where option_group.id = option_group_id
      and item.restaurant_id = public.current_staff_restaurant_id()
      and public.current_staff_role() = 'admin'
      and not public.current_staff_is_demo()
  )
)
with check (
  exists (
    select 1
    from public.menu_option_groups option_group
    join public.menu_items item on item.id = option_group.menu_item_id
    where option_group.id = option_group_id
      and item.restaurant_id = public.current_staff_restaurant_id()
      and public.current_staff_role() = 'admin'
      and not public.current_staff_is_demo()
  )
);

create or replace function public.transition_order_status(
  p_order_id uuid,
  p_next_status public.order_status
) returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_order public.orders%rowtype;
  v_allowed boolean := false;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if not found then raise exception using errcode = '42501', message = 'Akses staf diperlukan.'; end if;
  if v_profile.role = 'admin' and v_profile.is_demo then
    raise exception using errcode = '42501', message = 'Admin demo hanya memiliki akses baca.';
  end if;

  select * into v_order from public.orders where id = p_order_id and restaurant_id = v_profile.restaurant_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Pesanan tidak ditemukan.'; end if;

  v_allowed := case v_order.status
    when 'pending' then p_next_status in ('confirmed', 'cancelled')
    when 'confirmed' then p_next_status in ('preparing', 'cancelled')
    when 'preparing' then p_next_status in ('ready', 'cancelled')
    when 'ready' then p_next_status = 'served'
    when 'served' then p_next_status = 'completed'
    else false
  end;
  if not v_allowed then raise exception using errcode = '22023', message = 'Perubahan status tidak valid.'; end if;

  if v_profile.role = 'kitchen' and p_next_status not in ('confirmed', 'preparing', 'ready') then
    raise exception using errcode = '42501', message = 'Peran dapur tidak diizinkan mengubah ke status ini.';
  end if;
  if v_profile.role = 'cashier' and p_next_status not in ('served', 'completed', 'cancelled') then
    raise exception using errcode = '42501', message = 'Peran kasir tidak diizinkan mengubah ke status ini.';
  end if;
  if v_profile.role = 'waiter' and p_next_status <> 'served' then
    raise exception using errcode = '42501', message = 'Peran pelayan tidak diizinkan mengubah ke status ini.';
  end if;

  update public.orders set status = p_next_status where id = p_order_id returning * into v_order;
  return v_order;
end;
$$;

create or replace function public.set_order_payment_status(
  p_order_id uuid,
  p_payment_status public.payment_status
) returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  v_profile public.profiles%rowtype;
  v_order public.orders%rowtype;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if not found or v_profile.role not in ('admin', 'cashier') then
    raise exception using errcode = '42501', message = 'Akses kasir diperlukan.';
  end if;
  if v_profile.role = 'admin' and v_profile.is_demo then
    raise exception using errcode = '42501', message = 'Admin demo hanya memiliki akses baca.';
  end if;
  update public.orders set payment_status = p_payment_status
  where id = p_order_id and restaurant_id = v_profile.restaurant_id
  returning * into v_order;
  if not found then raise exception using errcode = 'P0002', message = 'Pesanan tidak ditemukan.'; end if;
  return v_order;
end;
$$;
