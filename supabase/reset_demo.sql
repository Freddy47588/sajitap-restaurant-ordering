-- Developer-only reset for the isolated SajiTap demo tenant. Run from the
-- Supabase SQL editor or another trusted database-owner session. Never expose
-- this script through a frontend endpoint.
begin;

delete from public.orders
where restaurant_id = '00000000-0000-0000-0000-000000000001';

update public.restaurant_tables
set active = table_number <> '8'
where restaurant_id = '00000000-0000-0000-0000-000000000001';

update public.categories
set active = true
where restaurant_id = '00000000-0000-0000-0000-000000000001';

update public.menu_items
set
  available = slug <> 'bakso',
  featured = slug in (
    'sate-ayam',
    'nasi-goreng-telur',
    'nasi-rames',
    'mie-ayam-bakso',
    'lontong-opor-ayam',
    'es-teh-manis',
    'pisang-goreng'
  )
where restaurant_id = '00000000-0000-0000-0000-000000000001';

commit;
