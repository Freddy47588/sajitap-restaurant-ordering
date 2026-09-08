create or replace function public.set_order_payment_status(p_order_id uuid, p_payment_status public.payment_status)
returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  v_profile public.profiles%rowtype;
  v_order public.orders%rowtype;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if not found or v_profile.role not in ('admin', 'cashier') then
    raise exception using errcode = '42501', message = 'Akses kasir diperlukan.';
  end if;
  update public.orders set payment_status = p_payment_status
  where id = p_order_id and restaurant_id = v_profile.restaurant_id
  returning * into v_order;
  if not found then raise exception using errcode = 'P0002', message = 'Pesanan tidak ditemukan.'; end if;
  return v_order;
end;
$$;
revoke all on function public.set_order_payment_status(uuid, public.payment_status) from public;
grant execute on function public.set_order_payment_status(uuid, public.payment_status) to authenticated;
