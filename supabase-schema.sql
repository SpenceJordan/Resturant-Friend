-- Run this in Supabase SQL Editor to create tables for the restaurant site.

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

-- Enable RLS on all tables
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.menu_images enable row level security;

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
