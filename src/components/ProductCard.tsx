import type { Product } from '@/lib/types';
import { link } from '@/lib/router';
import { formatPrice } from '@/lib/products';
import ProductImage from '@/components/ProductImage';
import ShareButton from '@/components/ShareButton';

interface ProductCardProps {
  product: Product;
  navigate: (to: string) => void;
  index?: number;
}

const COLOR_SWATCH: Record<string, string> = {
  Noir: '#1a1a1a',
  Châtain: '#6B4226',
  Auburn: '#A0522D',
  'Brun foncé': '#3B2417',
  'Blond platine': '#E8D9B5',
  Fauve: '#C1704A',
  Écru: '#EFE6D5',
  'Vert sauge': '#9CAF9A',
  Sable: '#D8C7A8',
  Terracotta: '#C2674A',
  Émeraude: '#2F6E54',
  Bordeaux: '#5E2129',
  Indigo: '#3A4A6B',
  Terre: '#8B5E3C',
  Cuivre: '#B87333',
  Multicolore: 'linear-gradient(135deg,#C1704A,#2F4A3D,#E8D9B5)',
  Poudre: '#E8C9C0',
};

export function colorSwatch(color: string): string {
  return COLOR_SWATCH[color] ?? '#C1704A';
}

export default function ProductCard({ product, navigate, index = 0 }: ProductCardProps) {
  return (
    <article
      className="group cursor-pointer fade-in-up"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      onClick={() => navigate(`/produit/${product.slug}`)}
    >
      <div className="relative overflow-hidden bg-nge-bg">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="aspect-[4/5]"
          imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-[0.2em] text-nge-black bg-white/90 px-2.5 py-1">
            {product.badge}
          </span>
        )}
        {product.compareAtPrice && (
          <span className="absolute right-3 top-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white bg-nge-warm px-2.5 py-1">
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </span>
        )}
        <ShareButton
          slug={product.slug}
          name={product.name}
          className="absolute bottom-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-display text-lg font-normal leading-snug text-nge-black">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="font-num text-base font-semibold text-nge-black">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="font-num text-xs font-semibold text-nge-muted line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          {product.colors.slice(0, 4).map((c) => (
            <span
              key={c}
              className="h-3 w-3 rounded-full ring-1 ring-nge-line"
              style={{ background: colorSwatch(c) }}
              title={c}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export { link };
