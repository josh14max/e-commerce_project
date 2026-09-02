import { useEffect, useState } from 'react';
import { Check, Clock, Loader2, RefreshCw, ShoppingBag, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/products';
import { useCart } from '@/lib/cart';
import type { OrderRow } from '@/lib/types';

interface PaymentConfirmationProps {
  navigate: (to: string) => void;
}

type ConfirmationState = 'verifying' | 'success' | 'failed' | 'pending';

interface StoredConfirmation {
  orderId: string;
  accessToken: string;
}

const CONFIRMATION_STORAGE_KEY = 'ng-hair-payment-confirmation';

function readConfirmation(): StoredConfirmation | null {
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  const query = new URLSearchParams(window.location.search || hashQuery);
  const orderId = query.get('order_id');
  const accessToken = query.get('access_token');

  if (orderId && accessToken) {
    const confirmation = { orderId, accessToken };
    sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, JSON.stringify(confirmation));
    // Le jeton privé ne reste pas visible dans la barre d'adresse.
    window.history.replaceState({}, '', '/paiement/confirmation');
    return confirmation;
  }

  try {
    const stored = sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredConfirmation) : null;
  } catch {
    return null;
  }
}

export default function PaymentConfirmation({ navigate }: PaymentConfirmationProps) {
  const { clear } = useCart();
  const [status, setStatus] = useState<ConfirmationState>('verifying');
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const confirmation = readConfirmation();
    if (!confirmation) {
      setStatus('failed');
      setErrorMsg('Informations de confirmation manquantes. Revenez à votre panier pour réessayer.');
      return;
    }

    let active = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const maxAttempts = 20;

    const verify = async () => {
      attempts += 1;
      try {
        const { data, error } = await supabase.functions.invoke('payment-status', {
          body: {
            orderId: confirmation.orderId,
            accessToken: confirmation.accessToken,
          },
        });
        if (!active) return;
        if (error || !data) throw error ?? new Error('Réponse de confirmation vide');

        if (data.status === 'paid') {
          setOrder(data.order as OrderRow);
          setStatus('success');
          sessionStorage.removeItem(CONFIRMATION_STORAGE_KEY);
          clear();
          return;
        }
        if (data.status === 'failed' || data.status === 'cancelled') {
          setStatus('failed');
          setErrorMsg(
            data.status === 'cancelled'
              ? 'Le paiement a été annulé.'
              : 'Le paiement a été refusé ou a échoué.',
          );
          return;
        }
      } catch (error) {
        console.error('Payment confirmation error', error);
      }

      if (attempts < maxAttempts) {
        timer = setTimeout(verify, 3000);
      } else {
        setStatus('pending');
        setErrorMsg('Le paiement est encore en cours de confirmation. Aucun nouveau paiement n’est nécessaire.');
      }
    };

    verify();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
    // La confirmation n'est lue qu'au chargement de la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'verifying') {
    return (
      <div className="container-ora py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-ora-text-muted mx-auto mb-6" />
        <h1 className="font-display text-2xl font-light text-ora-text mb-2">Vérification du paiement...</h1>
        <p className="text-ora-text-muted">Nous attendons la confirmation sécurisée de Moneroo.</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="container-ora py-24 text-center max-w-lg mx-auto fade-in">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-100 mx-auto mb-6">
          <Clock className="h-8 w-8 text-amber-700" />
        </div>
        <h1 className="font-display text-3xl font-light text-ora-text mb-3">Paiement en cours de confirmation</h1>
        <p className="text-ora-text-muted mb-8">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          <RefreshCw className="h-4 w-4" /> Vérifier à nouveau
        </button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container-ora py-24 text-center max-w-lg mx-auto fade-in">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-red-100 mx-auto mb-6">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="font-display text-3xl font-light text-ora-text mb-3">Paiement non abouti</h1>
        <p className="text-ora-text-muted mb-8">
          {errorMsg || 'Le paiement n’a pas pu être finalisé. Vous pouvez réessayer.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/commande')} className="btn-primary">
            <RefreshCw className="h-4 w-4" /> Réessayer le paiement
          </button>
          <button onClick={() => navigate('/perruques')} className="btn-outline">
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  const depositAmount = Number(order?.deposit_amount ?? 0);
  const subtotal = Number(order?.subtotal ?? 0);

  return (
    <div className="container-ora py-16 sm:py-24 max-w-2xl mx-auto fade-in">
      <div className="text-center mb-10">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100 mx-auto mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ora-text mb-3 tracking-tight">
          Paiement confirmé !
        </h1>
        <p className="text-ora-text-muted max-w-md mx-auto">
          Votre dépôt de validation a bien été reçu. Votre commande est confirmée.
          Le solde sera réglé à la livraison.
        </p>
      </div>

      {order && (
        <div className="border border-ora-line bg-white p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="eyebrow flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Récapitulatif
            </p>
            <span className="text-xs text-ora-text-muted">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div key={`${item.productId}-${item.variantValue}-${index}`} className="flex justify-between text-sm">
                <span className="text-ora-text">
                  {item.quantity}× {item.name}
                  {item.variantLabel && item.variantLabel !== 'Standard' && (
                    <span className="text-ora-text-muted"> — {item.variantLabel}</span>
                  )}
                </span>
                <span className="font-num font-semibold text-ora-text whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-ora-line/60 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ora-text-muted">Sous-total</span>
              <span className="font-num font-semibold text-ora-text">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ora-text-muted">Dépôt payé</span>
              <span className="font-num font-semibold text-green-700">{formatPrice(depositAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ora-text-muted">Solde à la livraison</span>
              <span className="font-num font-semibold text-ora-text">
                {formatPrice(Math.max(0, subtotal - depositAmount))}
              </span>
            </div>
          </div>

          <div className="border-t border-ora-line/60 mt-4 pt-4 flex justify-between items-baseline">
            <span className="font-display text-xl font-light text-ora-text">Total</span>
            <span className="font-num text-2xl font-bold text-ora-text tracking-tight">{formatPrice(Number(order.total))}</span>
          </div>

          <div className="mt-6 pt-6 border-t border-ora-line/60 text-sm space-y-1">
            <p className="text-ora-text-muted">
              <span className="font-medium text-ora-text">{order.first_name} {order.last_name}</span>
            </p>
            {order.address && <p className="text-ora-text-muted">{order.address}{order.city ? `, ${order.city}` : ''}</p>}
            {order.country && <p className="text-ora-text-muted">{order.country}</p>}
            <p className="text-ora-text-muted">{order.phone} — {order.email}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => navigate('/')} className="btn-outline">Retour à l'accueil</button>
        <button onClick={() => navigate('/perruques')} className="btn-primary">Continuer mes achats</button>
      </div>
    </div>
  );
}
