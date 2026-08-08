import { PRODUCTS } from '../src/lib/products';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: any, res: any) {
  const slugParam = req.query?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam ?? '';

  const product = PRODUCTS.find((p) => p.slug === slug);

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host;
  const baseUrl = `${proto}://${host}`;

  // Récupère le vrai HTML déployé (avec les noms de fichiers JS/CSS générés au build),
  // pour ne jamais avoir à les recopier à la main ici.
  let html: string;
  try {
    const htmlRes = await fetch(`${baseUrl}/index.html`);
    html = await htmlRes.text();
  } catch {
    res.status(502).send('Erreur de génération de la page');
    return;
  }

  if (product) {
    const title = `${product.name} — NG Hair`;
    const description = (product.shortDescription || product.description || '').slice(0, 160);
    const image = product.images?.[0] || `${baseUrl}/og-image.jpg`;
    const url = `${baseUrl}/produit/${product.slug}`;

    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description" content="[^"]*"\s*\/>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
      )
      .replace(
        /<meta property="og:title" content="[^"]*"\s*\/>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
      )
      .replace(
        /<meta property="og:description" content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
      )
      .replace(
        /<meta property="og:type" content="[^"]*"\s*\/>/,
        `<meta property="og:type" content="product" />`
      )
      .replace(
        /<meta property="og:image" content="[^"]*"\s*\/>/,
        `<meta property="og:image" content="${escapeHtml(image)}" />`
      )
      .replace(
        /<meta name="twitter:image" content="[^"]*"\s*\/>/,
        `<meta name="twitter:image" content="${escapeHtml(image)}" />`
      )
      .replace('</head>', `  <meta property="og:url" content="${escapeHtml(url)}" />\n  </head>`);
  }
  // Si le produit n'existe pas (lien cassé, ancien slug) : on sert le HTML tel quel,
  // avec les balises génériques du site — pas d'erreur, juste pas de personnalisation.

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.status(200).send(html);
}
