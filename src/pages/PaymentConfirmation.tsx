import { useEffect, useState } from 'react';
import { Check, X, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/products';
import type { OrderRow } from '@/lib/types';

interface PaymentConfirmationProps {
  navigate: (to: string) => void;
}

export default function PaymentConfirmation({ navigate }: PaymentConfirmationProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    const orderId = params.get('order_id');
    const transactionId = params.get('transaction_id');

    if (!orderId || !transactionId) {
      setStatus('failed');
      setErrorMsg('Informations de paiement manquantes.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    async function verify() {
      attempts++;
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cinetpay-verify?transaction_id=${transactionId}&order_id=${orderId}`;
        const resp = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        if (!resp.ok) {
          if (attempts < maxAttempts) {
            setTimeout(verify, 2000);
            return;
          }
          throw new Error('Vérification impossible');
        }

        const data = await resp.json();

        if (data.status === 'paid') {
          // Fetch the order to display summary
          const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

          setOrder(orderData as OrderRow | null);
          setStatus('success');
        } else if (data.status === 'failed') {
          setStatus('failed');
          setErrorMsg('Le paiement a été refusé ou a échoué.');
        } else if (attempts < maxAttempts) {
          // Still pending — retry
          setTimeout(verify, 2000);
        } else {
          setStatus('failed');
          setErrorMsg('Le paiement est resté en attente trop longtemps.');
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(verify, 2000);
        } else {
          setStatus('failed');
          setErrorMsg('Impossible de vérifier le paiement. Contactez-nous si vous avez été débité.');
        }
      }
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'verifying') {
    return (
      <div className="container-ora py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-ora-text-muted mx-auto mb-6" />
        <h1 className="font-display text-2xl font-light text-ora-text mb-2">Vérification du paiement...</h1>
        <p className="text-ora-text-muted">Nous confirmons votre paiement, veuillez patienter.</p>
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
          {errorMsg || 'Le paiement n\'a pas pu être finalisé. Vous pouvez réessayer.'}
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

  // Success state with order summary
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
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
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
              <span className="font-num font-semibold text-ora-text">{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ora-text-muted">Dépôt payé</span>
              <span className="font-num font-semibold text-green-700">{formatPrice(2000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ora-text-muted">Solde à la livraison</span>
              <span className="font-num font-semibold text-ora-text">{formatPrice(Number(order.subtotal) - 2000)}</span>
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
            <p className="text-ora-text-muted">{order.address}, {order.city}</p>
            <p className="text-ora-text-muted">{order.phone} — {order.email}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => navigate('/')} className="btn-outline">
          Retour à l'accueil
        </button>
        <button onClick={() => navigate('/perruques')} className="btn-primary">
          Continuer mes achats
        </button>
      </div>
    </div>
  );
}
