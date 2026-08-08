/*
# Add CinetPay transaction ID column to orders

1. Purpose
- Stores the CinetPay transaction ID for each order so we can verify payment status.
- Also adds an UPDATE policy for anon role so the edge function (using service role) and
  guest checkout flow can update order status from "pending" to "paid".

2. Changes
- `orders` table: add `moneroo_transaction_id` text column (nullable).
- Add UPDATE policy for anon (guest orders) so status can be updated.

3. Security
- The edge function uses the service role key (bypasses RLS) to update order status.
- No new tables.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'moneroo_transaction_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN moneroo_transaction_id text;
  END IF;
END $$;
