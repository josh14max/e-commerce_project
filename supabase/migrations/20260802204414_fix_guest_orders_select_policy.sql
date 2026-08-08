DROP POLICY IF EXISTS "select_guest_orders_by_email" ON orders;

CREATE POLICY "select_guest_orders" ON orders FOR SELECT
  TO anon USING (user_id IS NULL);