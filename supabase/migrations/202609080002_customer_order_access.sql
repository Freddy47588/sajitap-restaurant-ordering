alter table public.orders
add column customer_session_id uuid references auth.users(id) on delete set null;

create or replace function public.assign_customer_session() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.customer_session_id is null then
    new.customer_session_id := auth.uid();
  end if;
  return new;
end;
$$;

create trigger orders_assign_customer_session
before insert on public.orders
for each row execute function public.assign_customer_session();

create policy "customers read own orders" on public.orders
for select to authenticated
using (customer_session_id = auth.uid());

create policy "customers read own order items" on public.order_items
for select to authenticated
using (exists (
  select 1 from public.orders customer_order
  where customer_order.id = order_id and customer_order.customer_session_id = auth.uid()
));

create policy "customers read own order item options" on public.order_item_options
for select to authenticated
using (exists (
  select 1 from public.order_items customer_item
  join public.orders customer_order on customer_order.id = customer_item.order_id
  where customer_item.id = order_item_id and customer_order.customer_session_id = auth.uid()
));

alter publication supabase_realtime add table public.orders;
