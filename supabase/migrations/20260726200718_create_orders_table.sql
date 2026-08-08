/*
# Create orders table for ORA e-commerce

1. Purpose
- Stores customer orders for the ORA store (perruques + vêtements).
- Each order belongs to a signed-in customer (user_id) OR a guest (user_id NULL, email required).
- Order history is visible in the customer's account area.

2. New Tables
- `orders`
  - `id` uuid primary key
  - `user_id` uuid nullable (references auth.users; null for guest checkout)
  - `email` text not null (customer contact email)
  - `first_name` text not null
  - `last_name` text not null
  - `address` text not null
  - `address_complement` text nullable
  - `city` text not null
  - `postal_code` text not null
  - `country` text not null (France or international)
  - `phone` text not null
  - `items` jsonb not null (array of cart items: productId, name, price, quantity, variant)
  - `subtotal` numeric(10,2) not null
  - `shipping` numeric(10,2) not null
  - `total` numeric(10,2) not null
  - `status` text not null default 'pending' (pending, paid, shipped, delivered, cancelled)
  - `stripe_payment_intent_id` text nullable
  - `created_at` timestamptz default now()

3. Security
- Enable RLS on `orders`.
- SELECT: a user can read their own orders (by user_id) OR orders matching their email (guest orders).
- INSERT: authenticated users can insert their own orders; anon can insert guest orders (user_id must be null).
- UPDATE/DELETE: restricted to the owner (authenticated, matching user_id). Guests cannot update/delete.

4. Notes
- This is a hybrid auth model: signed-in customers get user_id-scoped orders; guests can still place orders with email only.
- The frontend reads orders by user_id when authenticated, or by email when a guest checks out.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  address text NOT NULL,
  address_complement text,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- SELECT: owner by user_id, or guest by email
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_guest_orders_by_email" ON orders;
CREATE POLICY "select_guest_orders_by_email" ON orders FOR SELECT
  TO anon, authenticated USING (user_id IS NULL AND email = current_setting('app.guest_email', true));

-- INSERT: authenticated users insert their own; anon inserts guest orders (user_id null)
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_guest_orders" ON orders;
CREATE POLICY "insert_guest_orders" ON orders FOR INSERT
  TO anon WITH CHECK (user_id IS NULL);

-- UPDATE/DELETE: owner only
DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for order history lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
