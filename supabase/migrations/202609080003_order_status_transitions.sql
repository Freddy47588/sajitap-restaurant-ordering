drop policy if exists "staff updates restaurant orders" on public.orders;
revoke update on public.orders from authenticated;

create or replace function public.transition_order_status(p_order_id uuid, p_next_status public.order_status)
returns public.orders
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

revoke all on function public.transition_order_status(uuid, public.order_status) from public;
grant execute on function public.transition_order_status(uuid, public.order_status) to authenticated;
