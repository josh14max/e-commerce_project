import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';

interface AdminResetPasswordProps {
  navigate: (to: string) => void;
}

export default function AdminResetPassword({ navigate }: AdminResetPasswordProps) {
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setError("Le lien a expiré ou n'est plus valide. Redemande un email depuis la page de connexion.");
    } else {
      setDone(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg">
        <p className="text-nge-muted text-sm">Chargement…</p>
      </div>
    );
  }

  // Ce lien n'est valide que juste après avoir cliqué sur l'email reçu.
  // Sans session active à ce moment-là, on ne peut pas savoir qui essaie de changer le mot de passe.
  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg px-4 text-center">
        <div>
          <h1 className="font-display text-2xl text-nge-black mb-2">Lien invalide ou expiré</h1>
          <p className="text-sm text-nge-muted mb-6">
            Redemande un nouvel email depuis la page de connexion.
          </p>
          <button onClick={() => navigate('/admin')} className="text-sm underline text-nge-muted hover:text-nge-black">
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-nge-bg px-4 text-center">
        <div>
          <h1 className="font-display text-2xl text-nge-black mb-2">Mot de passe mis à jour</h1>
          <p className="text-sm text-nge-muted mb-6">Tu peux maintenant te connecter avec.</p>
          <button onClick={() => navigate('/admin')} className="btn-primary">
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-nge-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-sm shadow-soft p-8">
        <h1 className="font-display text-2xl text-nge-black mb-1">Nouveau mot de passe</h1>
        <p className="text-sm text-nge-muted mb-6">Choisis un mot de passe d'au moins 8 caractères.</p>

        <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
        />

        <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
          Confirme le mot de passe
        </label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full mb-4 rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-full bg-nge-black text-white text-sm font-medium uppercase tracking-wide disabled:opacity-60"
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </div>
  );
}
