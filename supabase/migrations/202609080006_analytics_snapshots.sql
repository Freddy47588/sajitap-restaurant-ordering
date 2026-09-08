alter table public.order_items
add column category_name_snapshot text;

create or replace function public.assign_order_item_category_snapshot() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.category_name_snapshot is null and new.menu_item_id is not null then
    select category.name into new.category_name_snapshot
    from public.menu_items item join public.categories category on category.id = item.category_id
    where item.id = new.menu_item_id;
  end if;
  return new;
end;
$$;

create trigger order_items_assign_category_snapshot
before insert on public.order_items
for each row execute function public.assign_order_item_category_snapshot();
