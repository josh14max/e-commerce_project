import { useEffect, useState } from 'react';
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { getProduct, getByCategory, formatPrice, getPriceForSize } from '@/lib/products';
import { useCart } from '@/lib/cart';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';
import ShareButton from '@/components/ShareButton';
import { colorSwatch } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

interface ProductDetailProps {
  slug: string;
  navigate: (to: string) => void;
}

export default function ProductDetail({ slug, navigate }: ProductDetailProps) {
  const { add } = useCart();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedTexture, setSelectedTexture] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingProduct(true);
    setProduct(undefined);
    setRelated([]);

    getProduct(slug).then((data) => {
      if (!active) return;
      setProduct(data);
      setLoadingProduct(false);
      setActiveImage(0);
      setSelectedVariant('');
      setSelectedColor(data?.colors[0] ?? '');
      setSelectedTexture(data?.textures?.[0] ?? data?.texture ?? '');

      if (data) {
        getByCategory(data.category).then((all) => {
          if (active) {
            setRelated(all.filter((p) => p.id !== data.id).slice(0, 4));
          }
        });
      }
    });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loadingProduct) {
    return <div className="container-ora py-24 text-center text-ora-text-muted">Chargement…</div>;
  }

  if (!product) {
    return (
      <div className="container-ora py-24 text-center">
        <h1 className="font-display text-2xl text-ora-text mb-3">Article introuvable</h1>
        <p className="text-ora-text-muted mb-6">Cet article n'existe plus ou n'a jamais existé.</p>
        <button onClick={() => navigate('/perruques')} className="btn-primary">Retour à la boutique</button>
      </div>
    );
  }

  // Determine variant selector type
  const isWig = product.category === 'wigs';
  const variantOptions = isWig
    ? product.lengths ?? []
    : product.sizes ?? [];
  const defaultVariant = variantOptions[0] ?? '';
  const currentVariant = selectedVariant || defaultVariant;
  const textureOptions = product.textures?.length ? product.textures : product.texture ? [product.texture] : [];
  const currentTexture = selectedTexture || textureOptions[0] || '';
  const currentPrice = isWig ? getPriceForSize(product.price, currentVariant) : product.price;

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: currentPrice,
        image: product.images[0],
        category: product.category,
        variantLabel: [selectedColor, currentTexture, currentVariant].filter(Boolean).join(' · '),
        variantValue: [selectedColor, currentTexture, currentVariant].filter(Boolean).join('__'),
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="container-ora py-6 sm:py-10">
      <button
        onClick={() => navigate(isWig ? '/perruques' : '/vetements')}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ora-text-muted hover:text-ora-text mb-8"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux {isWig ? 'perruques' : 'vêtements'}
      </button>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="fade-in">
          <ProductImage
            src={product.images[activeImage]}
            alt={product.name}
            eager
            className="aspect-[4/5] rounded-sm shadow-soft"
          />
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-sm overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-ora-text' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <ProductImage src={img} alt="" className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="fade-in-up">
          {product.badge && (
            <span className="eyebrow text-ora-accent mb-3">{product.badge}</span>
          )}
          <div className="flex items-start justify-between gap-4">

          <h1 className="font-display text-3xl sm:text-4xl font-light text-ora-text leading-tight tracking-tight">
            {product.name}
          </h1>
          <ShareButton slug={product.slug} name={product.name} variant="full" />
        </div>
          
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-num text-2xl font-bold text-ora-text">{formatPrice(currentPrice)}</span>
            {product.compareAtPrice && (
              <span className="font-num text-base font-semibold text-ora-text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="mt-5 text-base text-ora-text-muted leading-relaxed">{product.description}</p>

          {/* Color selector */}
          <div className="mt-7">
            <p className="label">Couleur : <span className="font-normal text-ora-text-muted">{selectedColor}</span></p>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  aria-label={c}
                  className={`relative h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-ora-bg transition-all ${
                    selectedColor === c ? 'ring-ora-text scale-110' : 'ring-ora-line hover:ring-ora-text/40'
                  }`}
                  style={{ background: colorSwatch(c) }}
                >
                  {selectedColor === c && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {textureOptions.length > 0 && (
            <div className="mt-5">
              <p className="label">Texture : <span className="font-normal text-ora-text-muted">{currentTexture}</span></p>
              <div className="flex flex-wrap gap-2">
                {textureOptions.map((texture) => (
                  <button
                    key={texture}
                    onClick={() => setSelectedTexture(texture)}
                    className={`min-w-12 rounded-full border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors ${
                      currentTexture === texture
                        ? 'border-ora-text bg-ora-text text-white'
                        : 'border-ora-line bg-transparent text-ora-text hover:border-ora-text'
                    }`}
                  >
                    {texture}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant selector (length for wigs, size for clothing) */}
          {variantOptions.length > 0 && (
            <div className="mt-5">
              <p className="label">Taille : <span className="font-normal text-ora-text-muted">{currentVariant}</span></p>
              <div className="flex flex-wrap gap-2">
                {variantOptions.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`min-w-12 rounded-full border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors ${
                      currentVariant === v
                        ? 'border-ora-text bg-ora-text text-white'
                        : 'border-ora-line bg-transparent text-ora-text hover:border-ora-text'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + add to cart */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <div className="inline-flex items-center rounded-full border border-ora-line bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-12 w-12 place-items-center rounded-full text-ora-text hover:bg-ora-bg-alt"
                aria-label="Diminuer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-base font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="grid h-12 w-12 place-items-center rounded-full text-ora-text hover:bg-ora-bg-alt"
                aria-label="Augmenter"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={handleAdd} className={`btn-primary flex-1 h-12 ${added ? 'bg-ora-accent hover:bg-ora-accent' : ''}`}>
              {added ? (
                <>
                  <Check className="h-5 w-5" /> Ajouté au panier
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> Ajouter au panier
                </>
              )}
            </button>
          </div>

          {/* Reassurance */}
          <div className="mt-8 pt-6 border-t border-ora-line/60" />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <h2 className="font-display text-2xl font-light text-ora-text mb-8 tracking-tight">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} navigate={navigate} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
