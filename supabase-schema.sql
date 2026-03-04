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

-- Optional: allow anonymous inserts (adjust RLS as needed for your auth)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Allow anonymous insert on orders"
  on public.orders for insert
  with check (true);

create policy "Allow anonymous insert on order_items"
  on public.order_items for insert
  with check (true);
