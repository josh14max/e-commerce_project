/*
# Catalogue produits en base de données + rôle admin

1. Contexte
- Jusqu'ici, les produits vivaient dans un fichier de code (src/lib/products.ts).
- Chaque changement de prix, couleur ou photo nécessitait un développeur.
- Cette migration fait passer le catalogue dans une vraie table, pour permettre
  une gestion autonome via un futur panneau d'administration.

2. Nouvelles tables
- `admins`
  - `user_id` uuid (référence auth.users) — le ou les comptes ayant les droits d'administration.
  - Table volontairement illisible depuis le client (RLS sans policy de lecture) ;
    consultée uniquement via la fonction is_admin() ci-dessous.
- `products`
  - Reprend tous les champs du catalogue actuel (nom, prix, couleurs, tailles, photos...).
  - `is_active` permet de masquer un produit sans le supprimer.

3. Fonction is_admin()
- SECURITY DEFINER : contourne la RLS de la table admins en interne pour vérifier
  si l'utilisateur connecté (auth.uid()) y figure. C'est la seule façon sûre de
  référencer une table "privée" depuis les policies d'autres tables.

4. Sécurité (RLS)
- `products` : lecture publique des produits actifs (le site marchand),
  lecture/écriture totale réservée à l'admin (is_admin()).
- `admins` : aucun accès direct depuis le client, ni anon ni authenticated.

5. Notes
- Aucune donnée existante n'est supprimée par cette migration — le fichier de
  code reste en place tant que le frontend n'a pas basculé dessus (migration suivante).
*/

-- ───────────────────────── admins ─────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- Volontairement aucune policy de lecture/écriture ici : cette table n'est
-- accessible que via la fonction is_admin() (SECURITY DEFINER) ci-dessous.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

-- ───────────────────────── products ─────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'wigs',
  universe text NOT NULL DEFAULT 'perruques',
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  texture text,
  length text,
  color text,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  lengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  textures jsonb NOT NULL DEFAULT '[]'::jsonb,
  badge text,
  profiles jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lecture publique : uniquement les produits actifs (le catalogue visible sur le site)
DROP POLICY IF EXISTS "public_read_active_products" ON products;
CREATE POLICY "public_read_active_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- L'admin voit tout, y compris les produits masqués
DROP POLICY IF EXISTS "admin_read_all_products" ON products;
CREATE POLICY "admin_read_all_products" ON products FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (is_admin());

-- updated_at automatique à chaque modification
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
