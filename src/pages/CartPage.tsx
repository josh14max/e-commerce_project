import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/products';
import ProductImage from '@/components/ProductImage';
import { useSiteSettings } from '@/lib/siteSettings';

interface CartPageProps {
  navigate: (to: string) => void;
}

export default function CartPage({ navigate }: CartPageProps) {
  const { items, setQuantity, remove, subtotal, count } = useCart();
  const { settings } = useSiteSettings();
  const paymentNames = settings.checkout.paymentMethods.map((method) => method === 'wave_ci' ? 'Wave' : 'Orange Money');

  if (items.length === 0) {
    return (
      <div className="container-ora py-24 sm:py-32 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ora-bg-alt text-ora-text mb-6">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="font-family text-3xl font-light text-ora-text mb-3 tracking-tight">Votre panier est vide</h1>
        <p className="text-ora-text-muted mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Pour l'instant. Explorez nos perruques, vous trouverez sûrement votre bonheur.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate('/perruques')} className="btn-primary">Voir les perruques</button>
          {/*
          <button onClick={() => navigate('/vetements')} className="btn-outline">Voir les vêtements</button>
          */}
        </div>
      </div>
    );
  }

  return (
    <div className="container-ora py-10 sm:py-16">
      <div className="mb-10 sm:mb-14">
        <p className="eyebrow mb-3">Votre sélection</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ora-text tracking-tight">Votre panier</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Items */}
        <div className="lg:col-span-8">
          <div className="divide-y divide-ora-line/60 border-t border-b border-ora-line/60">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantValue}`}
                className="flex gap-5 sm:gap-6 py-6 first:pt-6"
              >
                <button
                  onClick={() => navigate(`/produit/${item.slug}`)}
                  className="h-28 w-24 sm:h-32 sm:w-28 shrink-0"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full rounded-sm"
                  />
                </button>

                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        onClick={() => navigate(`/produit/${item.slug}`)}
                        className="font-display text-lg font-normal text-ora-text hover:text-ora-accent text-left transition-colors"
                      >
                        {item.name}
                      </button>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-ora-text-muted">{item.variantLabel}</p>
                    </div>
                    <button
                      onClick={() => remove(item.productId, item.variantValue)}
                      className="grid h-9 w-9 place-items-center rounded-full text-ora-text-muted hover:text-ora-text shrink-0 transition-colors"
                      aria-label="Retirer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="inline-flex items-center border border-ora-line rounded-full">
                      <button
                        onClick={() => setQuantity(item.productId, item.variantValue, item.quantity - 1)}
                        className="grid h-9 w-9 place-items-center rounded-full hover:bg-ora-bg-alt transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-normal">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.productId, item.variantValue, item.quantity + 1)}
                        className="grid h-9 w-9 place-items-center rounded-full hover:bg-ora-bg-alt transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-display text-lg font-normal text-ora-text">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/perruques')}
            className="inline-flex items-center gap-2 mt-8 text-xs font-medium uppercase tracking-[0.2em] text-ora-text-muted hover:text-ora-text transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Continuer mes achats
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-4">Récapitulatif</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ora-text-muted">Sous-total ({count} articles)</span>
                <span className="font-num text-base font-semibold text-ora-text-muted">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-ora-line/60 flex justify-between items-baseline">
              <span className="font-display text-xl font-normal text-ora-text">Total</span>
              <span className="font-num text-2xl font-bold text-ora-text tracking-tight">{formatPrice(subtotal)}</span>
            </div>
            <button onClick={() => navigate('/commande')} className="btn-primary w-full mt-7">
              Valider ma commande
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-xs text-center text-ora-text-muted leading-relaxed">
              Paiement sécurisé par {paymentNames.join(' ou ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
