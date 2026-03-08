
-- Orders (one row per checkout)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_city text not null,
  customer_postal text not null,
  customer_notes text,
  total numeric not null,
  payment_method text not null,
  created_at timestamptz default now()
);

-- Order line items (one row per item in an order)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_name text not null,
  price numeric not null
);

-- Menu images (one row per menu item, stores the image URL)
create table if not exists public.menu_images (
  item_name text primary key,
  image_url text not null,
  created_at timestamptz default now()
);

-- Custom menu sections added by admin
create table if not exists public.menu_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  created_at timestamptz default now()
);

-- Custom menu items added by admin
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  price numeric not null,
  description text,
  bio text,
  section text not null,
  image_data text,
  extra_images jsonb default '[]',
  gradient_start text,
  gradient_end text,
  initials text,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.menu_images enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_items enable row level security;

-- Drop existing policies so this script is safe to re-run
drop policy if exists "Allow anonymous select on orders" on public.orders;
drop policy if exists "Allow anonymous insert on orders" on public.orders;
drop policy if exists "Allow anonymous select on order_items" on public.order_items;
drop policy if exists "Allow anonymous insert on order_items" on public.order_items;
drop policy if exists "Allow anonymous read menu_images" on public.menu_images;
drop policy if exists "Allow anonymous upsert menu_images" on public.menu_images;
drop policy if exists "Allow anonymous update menu_images" on public.menu_images;

-- Orders: anon needs SELECT so .insert().select('id, created_at') returns the new row
create policy "Allow anonymous select on orders"
  on public.orders for select
  using (true);

create policy "Allow anonymous insert on orders"
  on public.orders for insert
  with check (true);

create policy "Allow anonymous select on order_items"
  on public.order_items for select
  using (true);

create policy "Allow anonymous insert on order_items"
  on public.order_items for insert
  with check (true);

create policy "Allow anonymous read menu_images"
  on public.menu_images for select
  using (true);

create policy "Allow anonymous upsert menu_images"
  on public.menu_images for insert
  with check (true);

create policy "Allow anonymous update menu_images"
  on public.menu_images for update
  using (true)
  with check (true);

-- Drop new policies so script is re-runnable
drop policy if exists "Allow anon select menu_sections" on public.menu_sections;
drop policy if exists "Allow anon insert menu_sections" on public.menu_sections;
drop policy if exists "Allow anon delete menu_sections" on public.menu_sections;
drop policy if exists "Allow anon select menu_items" on public.menu_items;
drop policy if exists "Allow anon insert menu_items" on public.menu_items;
drop policy if exists "Allow anon delete menu_items" on public.menu_items;

create policy "Allow anon select menu_sections" on public.menu_sections for select using (true);
create policy "Allow anon insert menu_sections" on public.menu_sections for insert with check (true);
create policy "Allow anon delete menu_sections" on public.menu_sections for delete using (true);

create policy "Allow anon select menu_items" on public.menu_items for select using (true);
create policy "Allow anon insert menu_items" on public.menu_items for insert with check (true);
create policy "Allow anon delete menu_items" on public.menu_items for delete using (true);

drop policy if exists "Allow anon update menu_items" on public.menu_items;
create policy "Allow anon update menu_items" on public.menu_items for update using (true) with check (true);

drop policy if exists "Allow anon update menu_sections" on public.menu_sections;
create policy "Allow anon update menu_sections" on public.menu_sections for update using (true) with check (true);

-- Key-value settings (section order, renames, etc.)
create table if not exists public.settings (
  key text primary key,
  value jsonb
);
alter table public.settings enable row level security;
drop policy if exists "Allow anon select settings" on public.settings;
drop policy if exists "Allow anon insert settings" on public.settings;
drop policy if exists "Allow anon update settings" on public.settings;
create policy "Allow anon select settings" on public.settings for select using (true);
create policy "Allow anon insert settings" on public.settings for insert with check (true);
create policy "Allow anon update settings" on public.settings for update using (true) with check (true);
