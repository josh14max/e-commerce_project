import { PRODUCTS } from '../src/lib/products';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Cette fonction n'est appelée que par les robots de prévisualisation (WhatsApp, Facebook, etc.)
// — voir la condition "has" dans vercel.json. Un vrai visiteur humain ne passe jamais par ici,
// il reçoit directement l'application normale. Comme les robots n'exécutent pas de JavaScript,
// pas besoin de renvoyer l'app complète : juste les balises meta, ce qui rend cette fonction
// simple et impossible à faire planter (aucun appel réseau, aucune dépendance externe).
export default function handler(req: any, res: any) {
  const slugParam = req.query?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam ?? '';
  const product = PRODUCTS.find((p) => p.slug === slug);

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host;
  const baseUrl = `${proto}://${host}`;

  const title = product ? `${product.name} — NG Hair` : 'NG Hair — La beauté qui vous ressemble';
  const description = product
    ? (product.shortDescription || product.description || '').slice(0, 160)
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
