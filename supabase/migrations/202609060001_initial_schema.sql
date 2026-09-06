create extension if not exists pgcrypto;

create type public.staff_role as enum ('admin', 'kitchen', 'cashier', 'waiter');
create type public.order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled');
create type public.payment_status as enum ('unpaid', 'paid');

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_number text not null check (char_length(table_number) between 1 and 20),
  label text not null,
  qr_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id, table_number)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  unique (restaurant_id, name)
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  code text not null,
  name text not null,
  slug text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  image_url text not null,
  available boolean not null default true,
  featured boolean not null default false,
  preparation_time text not null default '10–15 menit',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, code),
  unique (restaurant_id, slug)
);

create table public.menu_option_groups (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  name text not null,
  required boolean not null default false,
  min_select integer not null default 0 check (min_select >= 0),
  max_select integer not null default 1 check (max_select >= 1),
  sort_order integer not null default 0,
  check (min_select <= max_select)
);

create table public.menu_options (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references public.menu_option_groups(id) on delete cascade,
  name text not null,
  price_delta integer not null default 0 check (price_delta >= 0),
  available boolean not null default true,
  sort_order integer not null default 0
);

create table public.menu_item_recommendations (
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  recommended_menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  primary key (menu_item_id, recommended_menu_item_id),
  check (menu_item_id <> recommended_menu_item_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  table_id uuid not null references public.restaurant_tables(id),
  order_code text not null unique,
  customer_name text not null,
  customer_note text,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  subtotal integer not null check (subtotal >= 0),
  total integer not null check (total >= 0),
  estimated_preparation_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id),
  menu_item_name_snapshot text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0 and quantity <= 50),
  note text,
  subtotal integer not null check (subtotal >= 0)
);

create table public.order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  menu_option_id uuid references public.menu_options(id),
  option_name_snapshot text not null,
  price_delta integer not null check (price_delta >= 0)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text not null,
  role public.staff_role not null,
  created_at timestamptz not null default now()
);

create index orders_restaurant_status_created_idx on public.orders (restaurant_id, status, created_at desc);
create index orders_table_created_idx on public.orders (table_id, created_at desc);
create index menu_items_restaurant_category_idx on public.menu_items (restaurant_id, category_id, sort_order);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger menu_items_set_updated_at before update on public.menu_items for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

create function public.current_staff_restaurant_id() returns uuid
language sql stable security definer set search_path = ''
as $$ select restaurant_id from public.profiles where id = auth.uid() $$;

create function public.current_staff_role() returns public.staff_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

revoke all on function public.current_staff_restaurant_id() from public;
revoke all on function public.current_staff_role() from public;
grant execute on function public.current_staff_restaurant_id() to authenticated;
grant execute on function public.current_staff_role() to authenticated;

alter table public.restaurants enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_option_groups enable row level security;
alter table public.menu_options enable row level security;
alter table public.menu_item_recommendations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_options enable row level security;
alter table public.profiles enable row level security;

create policy "public reads restaurants" on public.restaurants for select to anon, authenticated using (true);
create policy "public reads active tables" on public.restaurant_tables for select to anon using (active);
create policy "staff reads own restaurant tables" on public.restaurant_tables for select to authenticated using (restaurant_id = public.current_staff_restaurant_id());
create policy "public reads active categories" on public.categories for select to anon, authenticated using (active);
create policy "public reads menu" on public.menu_items for select to anon, authenticated using (true);
create policy "public reads option groups" on public.menu_option_groups for select to anon, authenticated using (exists (select 1 from public.menu_items m where m.id = menu_item_id));
create policy "public reads available options" on public.menu_options for select to anon, authenticated using (available);
create policy "public reads recommendations" on public.menu_item_recommendations for select to anon, authenticated using (true);
create policy "staff reads restaurant orders" on public.orders for select to authenticated using (restaurant_id = public.current_staff_restaurant_id());
create policy "staff reads restaurant order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.restaurant_id = public.current_staff_restaurant_id()));
create policy "staff reads restaurant order options" on public.order_item_options for select to authenticated using (exists (select 1 from public.order_items oi join public.orders o on o.id = oi.order_id where oi.id = order_item_id and o.restaurant_id = public.current_staff_restaurant_id()));
create policy "staff reads own profile" on public.profiles for select to authenticated using (id = auth.uid());

create policy "admin manages tables" on public.restaurant_tables for all to authenticated using (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin') with check (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin');
create policy "admin manages categories" on public.categories for all to authenticated using (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin') with check (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin');
create policy "admin manages menu" on public.menu_items for all to authenticated using (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin') with check (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() = 'admin');
create policy "staff updates restaurant orders" on public.orders for update to authenticated using (restaurant_id = public.current_staff_restaurant_id() and public.current_staff_role() in ('admin', 'kitchen', 'cashier', 'waiter')) with check (restaurant_id = public.current_staff_restaurant_id());

revoke insert, update, delete on public.orders, public.order_items, public.order_item_options from anon;
