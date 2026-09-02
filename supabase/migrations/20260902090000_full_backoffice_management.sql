/*
  Back-office complet : variantes globales, contenu du site, réglages de paiement
  et stockage des images de sections.
*/

-- ───────────────────────── Variantes du catalogue ─────────────────────────

CREATE TABLE IF NOT EXISTS catalog_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('color', 'size', 'texture')),
  label text NOT NULL CHECK (length(trim(label)) > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (type, label)
);

ALTER TABLE catalog_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_catalog_options" ON catalog_options;
CREATE POLICY "public_read_catalog_options" ON catalog_options FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_catalog_options" ON catalog_options;
CREATE POLICY "admin_insert_catalog_options" ON catalog_options FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_catalog_options" ON catalog_options;
CREATE POLICY "admin_update_catalog_options" ON catalog_options FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_catalog_options" ON catalog_options;
CREATE POLICY "admin_delete_catalog_options" ON catalog_options FOR DELETE
  TO authenticated USING (is_admin());

INSERT INTO catalog_options (type, label, sort_order) VALUES
  ('texture', 'Lisse', 0), ('texture', 'Ondulé', 1), ('texture', 'Afro', 2),
  ('texture', 'Frison', 3), ('texture', 'Tresses', 4),
  ('size', '12', 0), ('size', '16', 1), ('size', '20', 2), ('size', '22', 3),
  ('size', '28', 4), ('size', '30', 5), ('size', '32', 6),
  ('color', 'Noir', 0), ('color', 'Châtain', 1), ('color', 'Auburn', 2),
  ('color', 'Brun foncé', 3), ('color', 'Blond platine', 4), ('color', 'Bordeaux', 5),
  ('color', 'Émeraude', 6), ('color', 'Gris argenté', 7), ('color', 'Rose', 8), ('color', 'Miel', 9)
ON CONFLICT (type, label) DO NOTHING;

CREATE OR REPLACE FUNCTION replace_jsonb_array_label(source jsonb, old_label text, new_label text)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      CASE WHEN item = old_label THEN to_jsonb(new_label) ELSE to_jsonb(item) END
      ORDER BY position
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements_text(COALESCE(source, '[]'::jsonb)) WITH ORDINALITY AS values_list(item, position);
$$;

CREATE OR REPLACE FUNCTION sync_catalog_option_to_products()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.type <> OLD.type THEN
      RAISE EXCEPTION 'Le type d''une option ne peut pas être modifié';
    END IF;
    IF NEW.label = OLD.label THEN
      RETURN NEW;
    END IF;

    IF OLD.type = 'color' THEN
      UPDATE products SET
        colors = replace_jsonb_array_label(colors, OLD.label, NEW.label),
        color = CASE WHEN color = OLD.label THEN NEW.label ELSE color END
      WHERE colors ? OLD.label OR color = OLD.label;
    ELSIF OLD.type = 'size' THEN
      UPDATE products SET
        lengths = replace_jsonb_array_label(lengths, OLD.label, NEW.label),
        length = CASE WHEN length = OLD.label THEN NEW.label ELSE length END
      WHERE lengths ? OLD.label OR length = OLD.label;
    ELSE
      UPDATE products SET
        textures = replace_jsonb_array_label(textures, OLD.label, NEW.label),
        texture = CASE WHEN texture = OLD.label THEN NEW.label ELSE texture END
      WHERE textures ? OLD.label OR texture = OLD.label;
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.type = 'color' THEN
    UPDATE products SET
      colors = colors - OLD.label,
      color = CASE WHEN color = OLD.label THEN NULL ELSE color END
    WHERE colors ? OLD.label OR color = OLD.label;
  ELSIF OLD.type = 'size' THEN
    UPDATE products SET
      lengths = lengths - OLD.label,
      length = CASE WHEN length = OLD.label THEN NULL ELSE length END
    WHERE lengths ? OLD.label OR length = OLD.label;
  ELSE
    UPDATE products SET
      textures = textures - OLD.label,
      texture = CASE WHEN texture = OLD.label THEN NULL ELSE texture END
    WHERE textures ? OLD.label OR texture = OLD.label;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_catalog_option ON catalog_options;
CREATE TRIGGER trg_sync_catalog_option
  BEFORE UPDATE OF type, label OR DELETE ON catalog_options
  FOR EACH ROW EXECUTE FUNCTION sync_catalog_option_to_products();

DROP TRIGGER IF EXISTS trg_catalog_options_updated_at ON catalog_options;
CREATE TRIGGER trg_catalog_options_updated_at
  BEFORE UPDATE ON catalog_options
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ───────────────────────── Contenu et paiement ─────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO site_settings (key, value) VALUES
  ('header', $json${"tickerItems":["Livraison soignée","Perruques","Beauté qui vous ressemble"]}$json$::jsonb),
  ('home', $json${"heroTitle":"La beauté qui","heroAccent":"vous ressemble.","heroSubtitle":"Des perruques pensées pour toutes les femmes.","heroDesktopImage":"/image-pres.webp","heroMobileImage":"/image-pres1.webp","featuredEyebrow":"Sélection NG Hair","featuredTitle":"Nos pièces phares","storyEyebrow":"NG Hair","storyTitle":"Une histoire de femmes, écrite pour toutes.","storyBody":"NG Hair est né d'une conviction simple : aucune femme ne devrait choisir entre esthétique, héritage et confort.","storyImage":"https://images.pexels.com/photos/3992652/pexels-photo-3992652.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop","storyButton":"Notre histoire"}$json$::jsonb),
  ('catalog', $json${"eyebrow":"Perruques","title":"Perruques pour toutes","subtitle":"Lisse, afro, ondulé, tresses — chaque texture a sa place ici. Filtrez pour trouver celle qui vous ressemble."}$json$::jsonb),
  ('footer', $json${"promiseTitle":"Pensé pour chaque femme","description":"Perruques pensées pour toutes les femmes, la beauté qui vous ressemble. Livrée chez vous.","copyright":"NG Hair. Tous droits réservés.","signature":"Conçu avec soin, pour toutes les femmes."}$json$::jsonb),
  ('checkout', $json${"eyebrow":"Finalisation","title":"Finaliser ma commande","customerTitle":"Vos coordonnées","depositLabel":"Dépôt de validation","depositAmount":2000,"depositDescription":"Ce dépôt confirme votre commande. Le solde est réglé à la livraison.","methodsTitle":"Modes de paiement","paymentButton":"Payer avec Wave ou Orange Money","securityText":"Paiement sécurisé. Vous serez redirigé pour régler le dépôt.","paymentMethods":["wave_ci","orange_ci"]}$json$::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2) NOT NULL DEFAULT 0;

-- ───────────────────────── Images des sections ─────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public_read_site_images" ON storage.objects;
CREATE POLICY "public_read_site_images" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "admin_insert_site_images" ON storage.objects;
CREATE POLICY "admin_insert_site_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'site-images' AND is_admin());

DROP POLICY IF EXISTS "admin_update_site_images" ON storage.objects;
CREATE POLICY "admin_update_site_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'site-images' AND is_admin())
  WITH CHECK (bucket_id = 'site-images' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_site_images" ON storage.objects;
CREATE POLICY "admin_delete_site_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'site-images' AND is_admin());

