/*
  Flux Moneroo de production : confirmation privée, création des commandes côté
  serveur et suppression de la lecture publique des commandes invitées.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_access_token uuid,
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS payment_initialized_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

UPDATE orders
SET payment_access_token = gen_random_uuid()
WHERE payment_access_token IS NULL;

ALTER TABLE orders
  ALTER COLUMN payment_access_token SET DEFAULT gen_random_uuid(),
  ALTER COLUMN payment_access_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_access_token
  ON orders(payment_access_token);

CREATE INDEX IF NOT EXISTS idx_orders_moneroo_transaction_id
  ON orders(moneroo_transaction_id)
  WHERE moneroo_transaction_id IS NOT NULL;

-- Une commande invitée ne doit jamais être lisible publiquement. Sa confirmation
-- passe désormais par la fonction payment-status et un jeton aléatoire.
DROP POLICY IF EXISTS "select_guest_orders" ON orders;
DROP POLICY IF EXISTS "select_guest_orders_by_email" ON orders;

-- Les commandes sont créées par create-payment après recalcul des prix en base.
DROP POLICY IF EXISTS "insert_guest_orders" ON orders;
DROP POLICY IF EXISTS "insert_own_orders" ON orders;

-- Nettoyage préventif d'anciennes policies de mise à jour anonyme.
DROP POLICY IF EXISTS "update_guest_orders" ON orders;
DROP POLICY IF EXISTS "anon_update_orders" ON orders;

-- Le statut d'un paiement et les données d'une commande ne doivent pas pouvoir
-- être modifiés ou supprimés directement par le compte client. Les traitements
-- de paiement utilisent la service role dans les fonctions Edge.
DROP POLICY IF EXISTS "update_own_orders" ON orders;
DROP POLICY IF EXISTS "delete_own_orders" ON orders;
