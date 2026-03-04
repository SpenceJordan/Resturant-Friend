# Supabase + Vercel – settings checklist

Your **Vercel site is the Next.js app** (`app/page.js`), not the standalone HTML file. Supabase is now wired into the Next.js checkout so orders can be saved to your project.

---

## 1. Supabase (Dashboard)

- **Project URL & anon key**  
  **Settings → API**: copy **Project URL** and **anon public** key. You’ll use these in Vercel.

- **Tables**  
  **Table Editor** should have:
  - `orders` (customer_name, customer_email, customer_phone, customer_address, customer_city, customer_postal, customer_notes, total, payment_method, created_at)
  - `order_items` (order_id, item_name, price)

- **RLS policies**  
  For the **anon** role, you need:
  - **orders**: one policy allowing **SELECT**, one allowing **INSERT**
  - **order_items**: one policy allowing **SELECT**, one allowing **INSERT**  

  If you’re not sure, run the full `supabase-schema.sql` in **SQL Editor** once (it creates tables and policies).

- **CORS**  
  Supabase allows browser requests by default. You only need to change this if you’ve restricted allowed origins.

---

## 2. Vercel – environment variables

So the Next.js app can talk to Supabase, set these in Vercel:

1. Open your project on [vercel.com](https://vercel.com) → **Settings → Environment Variables**.
2. Add:

   | Name | Value | Environments |
   |------|--------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://eimpmgytdzabsmjzrnot.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key (Settings → API in Supabase) | Production, Preview, Development |

3. **Save** and **redeploy** the project (Deployments → … → Redeploy) so the new variables are used.

---

## 3. Local development

1. Copy `.env.local.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
3. Run `npm install` (adds `@supabase/supabase-js`), then `npm run dev`.

---

## 4. Quick checks

- After redeploy, place a test order on the Vercel site. You should see the “Order saved successfully!” toast and a new row in **Supabase → Table Editor → orders** (and rows in `order_items`).
- If you see “Order not saved to cloud: …”, check the message and Supabase RLS policies; the order is still stored in localStorage and the receipt still shows.
