import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  saveSiteSection,
  useSiteSettings,
  type CheckoutSettings,
  type PaymentMethod,
} from '@/lib/siteSettings';
import { AdminField, AdminSection } from './AdminFields';

export default function PaymentSettingsManager() {
  const { settings, reload } = useSiteSettings();
  const [checkout, setCheckout] = useState<CheckoutSettings>(settings.checkout);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setCheckout(settings.checkout), [settings.checkout]);

  const toggleMethod = (method: PaymentMethod) => {
    setCheckout((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.includes(method)
        ? current.paymentMethods.filter((item) => item !== method)
        : [...current.paymentMethods, method],
    }));
  };

  const save = async () => {
    setMessage(null);
    if (!Number.isFinite(checkout.depositAmount) || checkout.depositAmount <= 0) {
      setMessage('Le montant du dépôt doit être supérieur à 0 FCFA.');
      return;
    }
    if (checkout.paymentMethods.length === 0) {
      setMessage('Active au moins un moyen de paiement.');
      return;
    }
    setSaving(true);
    const result = await saveSiteSection('checkout', checkout);
    setSaving(false);
    if (result.error) {
      setMessage(`Impossible d'enregistrer : ${result.error}`);
      return;
    }
    await reload();
    setMessage('Les réglages de paiement ont été mis à jour.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-nge-black">Paiement et dépôt</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-nge-muted">
            Le montant enregistré ici est aussi vérifié côté serveur avant d'ouvrir la page de paiement.
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-nge-black px-5 text-xs font-medium uppercase tracking-wide text-white disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {message && <p role="status" className="rounded-sm bg-nge-bg-alt p-3 text-sm text-nge-black">{message}</p>}

      <AdminSection title="Montant de validation">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-nge-muted">Dépôt à payer (FCFA)</span>
          <input
            type="number"
            min={1}
            step={1}
            value={checkout.depositAmount}
            onChange={(event) => setCheckout((current) => ({ ...current, depositAmount: Number(event.target.value) }))}
            className="w-full rounded-sm border border-nge-line px-3 py-3 text-base focus:border-nge-black focus:outline-none sm:max-w-xs"
          />
          <span className="mt-1 block text-xs text-nge-muted">Si le panier vaut moins que ce montant, la cliente paiera seulement le total du panier.</span>
        </label>
        <AdminField label="Nom de la section" value={checkout.depositLabel} onChange={(value) => setCheckout((current) => ({ ...current, depositLabel: value }))} />
        <AdminField label="Explication du dépôt" value={checkout.depositDescription} onChange={(value) => setCheckout((current) => ({ ...current, depositDescription: value }))} multiline />
      </AdminSection>

      <AdminSection title="Page de paiement">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Petit titre" value={checkout.eyebrow} onChange={(value) => setCheckout((current) => ({ ...current, eyebrow: value }))} />
          <AdminField label="Titre principal" value={checkout.title} onChange={(value) => setCheckout((current) => ({ ...current, title: value }))} />
          <AdminField label="Titre coordonnées" value={checkout.customerTitle} onChange={(value) => setCheckout((current) => ({ ...current, customerTitle: value }))} />
          <AdminField label="Titre moyens de paiement" value={checkout.methodsTitle} onChange={(value) => setCheckout((current) => ({ ...current, methodsTitle: value }))} />
        </div>
        <AdminField label="Texte du bouton" value={checkout.paymentButton} onChange={(value) => setCheckout((current) => ({ ...current, paymentButton: value }))} />
        <AdminField label="Message de sécurité" value={checkout.securityText} onChange={(value) => setCheckout((current) => ({ ...current, securityText: value }))} multiline />
      </AdminSection>

      <AdminSection title="Moyens de paiement actifs">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-sm border border-nge-line p-4 text-sm text-nge-black">
            <input type="checkbox" checked={checkout.paymentMethods.includes('wave_ci')} onChange={() => toggleMethod('wave_ci')} className="h-5 w-5" />
            Wave Côte d'Ivoire
          </label>
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-sm border border-nge-line p-4 text-sm text-nge-black">
            <input type="checkbox" checked={checkout.paymentMethods.includes('orange_ci')} onChange={() => toggleMethod('orange_ci')} className="h-5 w-5" />
            Orange Money Côte d'Ivoire
          </label>
        </div>
      </AdminSection>
    </div>
  );
}

