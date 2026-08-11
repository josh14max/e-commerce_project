/*
# Bucket de stockage pour les photos produits

1. Contexte
- Prépare le stockage pour la Phase 2 (upload de photo par glisser-déposer
  depuis le panneau d'administration).
- Sans ce bucket, aucune image ne peut être uploadée depuis l'interface admin.

2. Bucket `product-images`
- Public en lecture (les photos doivent s'afficher sur le site marchand,
  visible par n'importe quel visiteur, comme n'importe quelle image de produit).
- Écriture (upload, suppression) réservée à l'admin via is_admin().

3. Sécurité
- Même logique que la table `products` : lecture publique, écriture admin uniquement.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
CREATE POLICY "admin_upload_product_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-images' AND is_admin());
