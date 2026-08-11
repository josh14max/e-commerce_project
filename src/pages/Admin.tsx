import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { useIsAdmin } from '@/lib/useIsAdmin';

interface AdminProps {
  navigate: (to: string) => void;
}

export default function Admin({ navigate }: AdminProps) {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError('Email ou mot de passe incorrect.');
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg">
        <p className="text-nge-muted text-sm">Chargement…</p>
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
            className="w-full mb-4 rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
          />

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

  // Connecté et admin : tableau de bord
  // Les vraies sections (produits, commandes, contenu) arrivent en Phase 2, 3 et 4.
  return (
    <div className="min-h-screen bg-nge-bg">
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-nge-line">
        <span className="font-display text-lg text-nge-black">NG Hair — Administration</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-nge-muted hidden sm:inline">{user.email}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-nge-muted hover:text-nge-black"
          >
            Déconnexion
          </button>
        </div>
      </header>
      <div className="p-8 max-w-2xl">
        <h2 className="font-display text-xl text-nge-black mb-2">Connexion réussie</h2>
        <p className="text-sm text-nge-muted">
          Les fondations sont en place : base de données, sécurité, et cet accès protégé.
          Les outils de gestion (produits, commandes, contenu du site) arrivent dans les
          prochaines étapes.
        </p>
      </div>
    </div>
  );
}
