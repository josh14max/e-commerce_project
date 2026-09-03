import { useState } from 'react';
import { ChevronLeft, ShoppingBag, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { formatPrice } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import ProductImage from '@/components/ProductImage';
import { useSiteSettings } from '@/lib/siteSettings';

interface CheckoutProps {
  navigate: (to: string) => void;
}

interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

export default function Checkout({ navigate }: CheckoutProps) {
  const { items, subtotal, count } = useCart();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const checkout = settings.checkout;
  const depositAmount = Math.min(checkout.depositAmount, subtotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    country: 'Côte d\'Ivoire',
  });

  if (items.length === 0) {
    return (
      <div className="container-ora py-24 text-center">
        <h1 className="font-display text-2xl font-light text-ora-text mb-3">Votre panier est vide</h1>
        <p className="text-ora-text-muted mb-6">Ajoutez des articles avant de commander.</p>
        <button onClick={() => navigate('/perruques')} className="btn-primary">Découvrir la boutique</button>
      </div>
    );
  }

  const updateField = (field: keyof CustomerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function validateForm(): boolean {
    return form.firstName.trim() !== '' && form.lastName.trim() !== ''
      && form.email.trim() !== '' && form.phone.trim() !== '';
  }

  async function handlePay() {
    setError(null);
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      // The Edge Function creates the order and recalculates prices from the
      // catalog before initializing the Moneroo payment. This avoids exposing
      // a guest INSERT/SELECT flow on the orders table.
      const { data, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: {
          customer: {
            email: form.email.trim() || user?.email || '',
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            phone: form.phone.trim(),
            country: form.country.trim(),
          },
          items: items.map((item) => ({
            productId: item.productId,
            variantValue: item.variantValue,
            quantity: item.quantity,
          })),
          returnUrl: `${window.location.origin}/commande/confirmation`,
        },
      });

      if (paymentError) {
        const apiError =
          data && typeof data === 'object' && 'error' in data
            ? String((data as { error: string }).error)
            : null;
        throw new Error(
          apiError || 'Impossible d\'initialiser le paiement. Veuillez réessayer.',
        );
      }

      if (!data?.checkout_url) {
        throw new Error('URL de paiement manquante dans la réponse.');
      }

      // Moneroo redirects to the confirmation page. Only the webhook or a
      // server-side verification can mark the order as paid.
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du paiement.');
      setLoading(false);
    }
  }

  const inputClass = 'input';
  const labelClass = 'label';

  return (
    <div className="container-ora py-10 sm:py-16">
      <button
        onClick={() => navigate('/panier')}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ora-text-muted hover:text-ora-text mb-8"
      >
        <ChevronLeft className="h-4 w-4" /> Retour au panier
      </button>

      <div className="mb-10 sm:mb-14">
        <p className="eyebrow mb-3">{checkout.eyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ora-text tracking-tight">{checkout.title}</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left: customer form + deposit + payment */}
        <div className="lg:col-span-7">
          {/* Customer info form */}
          <section className="border-t border-ora-line/60 pt-8 mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-light text-ora-text mb-6 tracking-tight">
              {checkout.customerTitle}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass} htmlFor="firstName">Prénom *</label>
                <input id="firstName" className={inputClass} value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)} placeholder="Aminata" />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">Nom *</label>
                <input id="lastName" className={inputClass} value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)} placeholder="Koné" />
              </div>
              <div>
                <label className={labelClass} htmlFor="email">E-mail *</label>
                <input id="email" type="email" className={inputClass} value={form.email}
                  onChange={(e) => updateField('email', e.target.value)} placeholder="vous@exemple.fr" />
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">Téléphone *</label>
                <input id="phone" className={inputClass} value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)} placeholder="+225 07 00 00 00" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="country">Pays</label>
                <input id="country" className={inputClass} value={form.country}
                  onChange={(e) => updateField('country', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Deposit section */}
          <section className="border-t border-ora-line/60 pt-8">
            <div className="bg-nge-bg p-6 mb-8">
              <p className="eyebrow mb-3">{checkout.depositLabel}</p>
              <div className="flex items-baseline justify-between">
                <p className="font-num text-3xl font-bold text-ora-text tracking-tight">
                  {formatPrice(depositAmount)}
                </p>
                <p className="text-sm text-ora-text-muted">
                  Solde à la livraison : <span className="font-num font-semibold text-ora-text">{formatPrice(subtotal - depositAmount)}</span>
                </p>
              </div>
              <p className="mt-3 text-sm text-ora-text-muted leading-relaxed">
                {checkout.depositDescription}{' '}
                Le dépôt est de <span className="font-num font-semibold text-ora-text">{formatPrice(depositAmount)}</span> et le solde de{' '}
                <span className="font-num font-semibold text-ora-text">{formatPrice(subtotal - depositAmount)}</span> est réglé à la livraison.
              </p>
            </div>

            {/* Payment methods info */}
            <h2 className="font-display text-xl font-light text-ora-text mb-4 tracking-tight">
              {checkout.methodsTitle}
            </h2>
            <div className={`grid gap-4 mb-8 ${checkout.paymentMethods.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {checkout.paymentMethods.includes('wave_ci') && (
              <div className="flex flex-col items-center justify-center gap-3 p-5 border border-ora-line">
                <div className="h-16 w-full flex items-center justify-center">
                  <img src="/WAVE.jpeg" alt="Wave" className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-ora-text-muted">Wave</span>
              </div>
              )}
              {checkout.paymentMethods.includes('orange_ci') && (
              <div className="flex flex-col items-center justify-center gap-3 p-5 border border-ora-line">
                <div className="h-16 w-full flex items-center justify-center">
                  <img src="/Orange-Money-logo.png" alt="Orange Money" className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-ora-text-muted">Orange Money</span>
              </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 mb-6">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="btn-primary w-full h-14 text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redirection vers le paiement...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {checkout.paymentButton}
                </>
              )}
            </button>
            <p className="mt-4 text-xs text-center text-ora-text-muted">
              {checkout.securityText} Montant : {formatPrice(depositAmount)}.
            </p>
          </section>
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-4 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Votre commande
            </p>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantValue}`} className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0">
                    <ProductImage src={item.image} alt={item.name} className="h-full w-full rounded-sm" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ora-text text-[10px] font-medium text-white px-1">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-normal text-ora-text line-clamp-2">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.12em] text-ora-text-muted mt-0.5">{item.variantLabel}</p>
                  </div>
                  <span className="font-num text-sm font-semibold text-ora-text whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-ora-line/60 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ora-text-muted">Sous-total ({count} articles)</span>
                <span className="font-num font-semibold text-ora-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ora-text-muted">Dépôt de validation</span>
                <span className="font-num font-semibold text-ora-text">{formatPrice(depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ora-text-muted">Solde à la livraison</span>
                <span className="font-num font-semibold text-ora-text">{formatPrice(subtotal - depositAmount)}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-ora-line/60 flex justify-between items-baseline">
              <span className="font-display text-xl font-light text-ora-text">Total</span>
              <span className="font-num text-2xl font-bold text-ora-text tracking-tight">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
