import { createClient } from '@supabase/supabase-js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Cette fonction n'est appelée que par les robots de prévisualisation (WhatsApp, Facebook, etc.)
// — voir la condition "has" dans vercel.json. Un vrai visiteur humain ne passe jamais par ici,
// il reçoit directement l'application normale, qui va elle-même chercher le produit dans Supabase.
//
// Contrairement au reste de l'app, cette fonction interroge Supabase directement (pas via le
// client navigateur) car elle tourne côté serveur. Si la requête échoue pour une raison
// quelconque (réseau, config), elle ne plante jamais : elle retombe sur les balises génériques
// du site, jamais sur une erreur brute.
export default async function handler(req: any, res: any) {
  const slugParam = req.query?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam ?? '';

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host;
  const baseUrl = `${proto}://${host}`;

  let product: {
    name: string;
    short_description: string | null;
    description: string | null;
    images: string[] | null;
    slug: string;
  } | null = null;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (slug && supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase
        .from('products')
        .select('slug, name, short_description, description, images')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      product = data;
    } catch {
      // Supabase injoignable ou en erreur : on continue avec les balises génériques ci-dessous.
      product = null;
    }
  }

  const title = product ? `${product.name} — NG Hair` : 'NG Hair — La beauté qui vous ressemble';
  const description = product
    ? (product.short_description || product.description || '').slice(0, 160)
    : 'Des perruques pensées pour toutes les femmes.';
  const image = product?.images?.[0] || `${baseUrl}/og-image.jpg`;
  const url = product ? `${baseUrl}/produit/${product.slug}` : baseUrl;

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:type" content="${product ? 'product' : 'website'}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(url)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.status(200).send(html);
}
