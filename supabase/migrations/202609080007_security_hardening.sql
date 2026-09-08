-- Customer order creation must be tied to a Supabase user session. The web app
-- creates an anonymous Auth session for diners, so the database no longer needs
-- to accept calls made with the bare project anon key.
revoke execute on function public.create_customer_order(text, text, text, text, jsonb) from anon;
grant execute on function public.create_customer_order(text, text, text, text, jsonb) to authenticated;

-- This trigger is the final guard at the write boundary. Besides binding the
-- order to the JWT subject, it limits accidental retries and basic queue spam.
create or replace function public.assign_customer_session() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_recent_order_count integer;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Sesi pelanggan diperlukan.';
  end if;

  if new.customer_session_id is not null and new.customer_session_id <> auth.uid() then
    raise exception using errcode = '42501', message = 'Sesi pelanggan tidak valid.';
  end if;

  select count(*) into v_recent_order_count
  from public.orders
  where customer_session_id = auth.uid()
    and created_at >= now() - interval '10 minutes';

  if v_recent_order_count >= 5 then
    raise exception using errcode = '54000', message = 'Terlalu banyak pesanan. Coba lagi beberapa menit.';
  end if;

  new.customer_session_id := auth.uid();
  return new;
end;
$$;

revoke all on function public.assign_customer_session() from public;
