import { useEffect, useState } from 'react';
import { User as UserIcon, Package, LogOut, Mail, Lock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/products';
import type { OrderRow } from '@/lib/types';

interface AccountProps {
  navigate: (to: string) => void;
}

export default function Account({ navigate }: AccountProps) {
  const { user, session, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrders(data as OrderRow[]);
        setOrdersLoading(false);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);
    if (error) setFormError(error);
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container-ora py-24 text-center text-ora-text-muted">Chargement…</div>
    );
  }

  // Signed-in view
  if (session && user) {
    return (
      <div className="container-ora py-8 sm:py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-ora-accent text-white">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ora-text">Bonjour,</h1>
            <p className="text-ora-text-muted text-sm">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="ml-auto btn-outline">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>

        <section>
          <h2 className="font-display text-xl font-semibold text-ora-text mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-ora-accent" /> Historique de commandes
          </h2>

          {ordersLoading ? (
            <p className="text-ora-text-muted">Chargement…</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-ora-line bg-white p-8 text-center">
              <p className="font-display text-lg text-ora-text mb-1">Aucune commande pour l'instant</p>
              <p className="text-ora-text-muted text-sm mb-5">Vos commandes apparaîtront ici dès leur passage.</p>
              <button onClick={() => navigate('/perruques')} className="btn-primary">Commencer mes achats</button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-ora-line bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ora-text">
                        Commande #{o.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-ora-text-muted">
                        {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="chip bg-ora-bg-alt text-ora-text">{statusLabel(o.status)}</span>
                      <span className="font-display text-lg font-semibold text-ora-text">
                        {formatPrice(Number(o.total))}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.items.map((it, i) => (
                      <span key={i} className="chip border border-ora-line bg-ora-bg text-ora-text-muted">
                        {it.quantity}× {it.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Auth form
  return (
    <div className="container-ora py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-ora-line bg-white p-6 sm:p-8 shadow-soft">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ora-accent text-white mb-3">
              <UserIcon className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-ora-text">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-sm text-ora-text-muted mt-1">
              {mode === 'login'
                ? 'Accédez à votre historique de commandes.'
                : 'Rejoignez NG Hair pour suivre vos commandes.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-full bg-ora-bg-alt p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setFormError(null); }}
              className={`rounded-full py-2 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-white text-ora-text shadow-card' : 'text-ora-text-muted'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setMode('signup'); setFormError(null); }}
              className={`rounded-full py-2 text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-white text-ora-text shadow-card' : 'text-ora-text-muted'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ora-text-muted" />
                <input
                  id="email" type="email" required className="input pl-10"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ora-text-muted" />
                <input
                  id="password" type="password" required className="input pl-10" minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  {mode === 'login' ? 'Se connecter' : "S'inscrire"}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-ora-text-muted">
            {mode === 'login' ? "Pas encore de compte ? " : 'Déjà un compte ? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setFormError(null); }}
              className="text-ora-primary font-medium hover:underline"
            >
              {mode === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'En attente',
    paid: 'Payée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };
  return map[status] ?? status;
}
