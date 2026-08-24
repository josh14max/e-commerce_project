import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { formatPrice } from '@/lib/products';
import { getAllProductsForAdmin, deleteProduct } from '@/lib/adminProducts';
import type { Product } from '@/lib/types';
import ProductForm from '@/components/admin/ProductForm';

interface AdminProps {
  navigate: (to: string) => void;
}

export default function Admin({ navigate }: AdminProps) {
  const { user, loading: authLoading, signIn, signOut, requestPasswordReset } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoadingProducts(true);
    const data = await getAllProductsForAdmin();
    setProducts(data);
    setLoadingProducts(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin]);

  const handleDelete = async (slug: string) => {
    if (!confirm('Supprimer définitivement cet article ? Cette action est irréversible.')) return;
    setDeletingSlug(slug);
    const { error } = await deleteProduct(slug);
    setDeletingSlug(null);
    if (error) {
      alert(`Erreur lors de la suppression : ${error}`);
      return;
    }
    loadProducts();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError('Email ou mot de passe incorrect.');
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await requestPasswordReset(email);
    setSubmitting(false);
    if (error) {
      setError("Impossible d'envoyer l'email. Vérifie l'adresse.");
    } else {
      setForgotSent(true);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg">
        <p className="text-nge-muted text-sm">Chargement…</p>
      </div>
    );
  }

  // Pas connecté : formulaire "mot de passe oublié"
  if (!user && forgotMode) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg px-4">
        <div className="w-full max-w-sm bg-white rounded-sm shadow-soft p-8">
          {forgotSent ? (
            <>
              <h1 className="font-display text-2xl text-nge-black mb-3">Email envoyé</h1>
              <p className="text-sm text-nge-muted mb-6">
                Si un compte existe avec cette adresse, un lien pour choisir un nouveau mot de
                passe vient d'être envoyé. Vérifie ta boîte mail (et les spams).
              </p>
              <button
                onClick={() => {
                  setForgotMode(false);
                  setForgotSent(false);
                }}
                className="text-sm underline text-nge-muted hover:text-nge-black"
              >
                Retour à la connexion
              </button>
            </>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <h1 className="font-display text-2xl text-nge-black mb-1">Mot de passe oublié</h1>
              <p className="text-sm text-nge-muted mb-6">
                Entre ton email, on t'envoie un lien pour en choisir un nouveau.
              </p>
              <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
              />
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-full bg-nge-black text-white text-sm font-medium uppercase tracking-wide disabled:opacity-60 mb-3"
              >
                {submitting ? 'Envoi…' : 'Envoyer le lien'}
              </button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="w-full text-sm text-nge-muted hover:text-nge-black"
              >
                Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Pas connecté : formulaire de connexion
  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-sm shadow-soft p-8">
          <h1 className="font-display text-2xl text-nge-black mb-1">Administration NG Hair</h1>
          <p className="text-sm text-nge-muted mb-6">Connecte-toi pour gérer le site.</p>

          <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
          />

          <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-2 rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
          />

          <button
            type="button"
            onClick={() => {
              setError(null);
              setForgotMode(true);
            }}
            className="text-xs text-nge-muted hover:text-nge-black underline mb-4 block"
          >
            Mot de passe oublié ?
          </button>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-full bg-nge-black text-white text-sm font-medium uppercase tracking-wide disabled:opacity-60"
          >
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    );
  }

  // Connecté mais pas admin : accès refusé
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg px-4 text-center">
        <div>
          <h1 className="font-display text-2xl text-nge-black mb-2">Accès refusé</h1>
          <p className="text-sm text-nge-muted mb-6">
            Ce compte n'a pas les droits d'administration.
          </p>
          <button onClick={() => signOut()} className="text-sm underline text-nge-muted hover:text-nge-black">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // Connecté et admin : tableau de bord produits
  return (
    <div className="min-h-screen bg-nge-bg">
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-nge-line">
        <span className="font-display text-lg text-nge-black">NG Hair — Administration</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-nge-muted hidden sm:inline">{user.email}</span>
          <button onClick={() => signOut()} className="text-sm text-nge-muted hover:text-nge-black">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-nge-black">Produits ({products.length})</h2>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-nge-black text-white text-xs font-medium uppercase tracking-wide"
          >
            <Plus className="h-4 w-4" />
            Nouvel article
          </button>
        </div>

        {loadingProducts ? (
          <p className="text-sm text-nge-muted">Chargement…</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-nge-muted">Aucun article pour l'instant.</p>
        ) : (
          <div className="bg-white rounded-sm border border-nge-line divide-y divide-nge-line">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-14 w-14 rounded-sm object-cover bg-nge-bg-alt shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-nge-black truncate">{p.name}</p>
                    {p.isActive === false && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-nge-muted bg-nge-bg-alt px-1.5 py-0.5 rounded-sm shrink-0">
                        <EyeOff className="h-3 w-3" />
                        Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-nge-muted">
                    {formatPrice(p.price)}
                    {p.compareAtPrice && (
                      <span className="line-through ml-2 text-nge-muted/70">{formatPrice(p.compareAtPrice)}</span>
                    )}
                    {' · '}
                    {p.colors.length} couleur{p.colors.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(p);
                    setShowForm(true);
                  }}
                  className="grid h-9 w-9 place-items-center text-nge-muted hover:text-nge-black shrink-0"
                  aria-label="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.slug)}
                  disabled={deletingSlug === p.slug}
                  className="grid h-9 w-9 place-items-center text-nge-muted hover:text-red-600 shrink-0 disabled:opacity-50"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
