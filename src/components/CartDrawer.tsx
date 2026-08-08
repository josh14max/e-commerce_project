import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/products';
import ProductImage from '@/components/ProductImage';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  navigate: (to: string) => void;
}

export default function CartDrawer({ open, onClose, navigate }: CartDrawerProps) {
  const { items, setQuantity, remove, subtotal, count } = useCart();

  const goToCart = () => { onClose(); navigate('/panier'); };
  const goToCheckout = () => { onClose(); navigate('/commande'); };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-drawer transition-transform duration-300 ease-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-nge-line">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-nge-black" />
            <span className="font-family text-xl font-normal">Panier</span>
            <span className="text-sm text-nge-muted">({count})</span>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center text-nge-black hover:text-nge-warm transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center px-6 text-center">
            <div>
              <p className="font-display text-2xl font-light text-nge-black mb-2">Votre panier est vide</p>
              <p className="text-sm text-nge-muted mb-6">Découvrez nos perruques et vêtements.</p>
              <button onClick={() => { onClose(); navigate('/perruques'); }} className="btn-primary">
                Découvrir la boutique
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-nge-line">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantValue}`} className="flex gap-4 py-5 first:pt-0">
                <button
                  onClick={() => { onClose(); navigate(`/produit/${item.slug}`); }}
                  className="h-28 w-24 shrink-0"
                >
                  <ProductImage src={item.image} alt={item.name} className="h-full w-full" />
                </button>
                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => { onClose(); navigate(`/produit/${item.slug}`); }}
                      className="font-display text-base font-normal text-nge-black text-left hover:text-nge-warm transition-colors line-clamp-2"
                    >
                      {item.name}
                    </button>
                    <button
                      onClick={() => remove(item.productId, item.variantValue)}
                      className="grid h-7 w-7 place-items-center text-nge-muted hover:text-nge-black shrink-0"
                      aria-label="Retirer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-nge-muted">{item.variantLabel}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center border border-nge-line">
                      <button
                        onClick={() => setQuantity(item.productId, item.variantValue, item.quantity - 1)}
                        className="grid h-8 w-8 place-items-center hover:bg-nge-bg transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.productId, item.variantValue, item.quantity + 1)}
                        className="grid h-8 w-8 place-items-center hover:bg-nge-bg transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-num text-base font-semibold text-nge-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-nge-line px-6 py-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-nge-muted">Sous-total</span>
              <span className="font-num text-2xl font-bold text-nge-black">{formatPrice(subtotal)}</span>
            </div>
            <button onClick={goToCart} className="btn-outline w-full">Voir le panier</button>
            <button onClick={goToCheckout} className="btn-primary w-full">
              Commander <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
