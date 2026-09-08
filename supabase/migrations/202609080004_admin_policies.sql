create policy "admin manages option groups" on public.menu_option_groups for all to authenticated
using (exists (select 1 from public.menu_items item where item.id = menu_item_id and item.restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin'))
with check (exists (select 1 from public.menu_items item where item.id = menu_item_id and item.restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin'));

create policy "admin manages options" on public.menu_options for all to authenticated
using (exists (select 1 from public.menu_option_groups option_group join public.menu_items item on item.id = option_group.menu_item_id where option_group.id = option_group_id and item.restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin'))
with check (exists (select 1 from public.menu_option_groups option_group join public.menu_items item on item.id = option_group.menu_item_id where option_group.id = option_group_id and item.restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin'));

create policy "admin reads restaurant profiles" on public.profiles for select to authenticated
using (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin');
