import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  slug: string;
  name: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export default function ShareButton({ slug, name, variant = 'icon', className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const url = `${window.location.origin}/produit/${slug}`;
    const shareData = {
      title: `NG Hair — ${name}`,
      text: `Découvre ${name} sur NG Hair`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // l'utilisateur a fermé le menu de partage sans rien choisir → rien à faire
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie ce lien :', url);
    }
  };

  if (variant === 'full') {
    return (
      <div className="relative shrink-0">
        <button
          onClick={handleShare}
          aria-label="Partager cet article"
          className={`grid h-10 w-10 place-items-center rounded-full border border-ora-line text-ora-text hover:border-ora-text transition-colors ${className}`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        </button>
        {copied && (
          <span className="absolute -bottom-7 right-0 whitespace-nowrap text-[11px] font-medium text-ora-text-muted">
            Lien copié !
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`relative grid h-9 w-9 place-items-center rounded-full bg-white/95 text-nge-black shadow-soft hover:bg-white transition-colors ${className}`}
      aria-label="Partager ce produit"
      title="Partager ce produit"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </button>
  );
}
