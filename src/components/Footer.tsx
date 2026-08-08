import { Heart } from 'lucide-react';

interface FooterProps {
  navigate: (to: string) => void;
}

export default function Footer({ navigate }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-nge-line bg-white">
      <div className="container-ora py-14">
        {/* Promise strip */}
        <div className="grid gap-6 sm:grid-cols-1 mb-10 pb-10 border-b border-nge-line">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-nge-bg text-nge-warm">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base font-normal text-nge-black">Pensé pour chaque femme</p>
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-3">
            <span className="flex items-center gap-3 leading-none">
              <span className="font-display text-3xl sm:text-4xl text-nge-black">NG</span>
              <span className="h-6 sm:h-7 w-px bg-nge-gold" />
              <span className="font-display text-3xl sm:text-4xl font-light tracking-[0.12em] text-nge-warm">
                  HAIR
              </span>
              </span>
              <span className="mt-1.5 flex items-center gap-2">
              <span className="h-px w-6 bg-nge-gold" />
              <span className="text-[9px] font-medium uppercase tracking-[0.35em] text-nge-black">
                  Perruques
              </span>
              <span className="h-px w-6 bg-nge-gold" />
               </span>
            </div>
            <p className="text-sm text-nge-muted max-w-xs leading-relaxed font-light">
              Perruques pensées pour toutes les femmes, la beauté qui vous ressemble. Livrée chez vous.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nge-black mb-4">Boutique</p>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => navigate('/perruques')} className="text-nge-muted hover:text-nge-black transition-colors">Perruques</button></li>
              <li><button onClick={() => navigate('/panier')} className="text-nge-muted hover:text-nge-black transition-colors">Mon panier</button></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nge-black mb-4">Maison NG</p>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => navigate('/a-propos')} className="text-nge-muted hover:text-nge-black transition-colors">À propos</button></li>
              <li><button onClick={() => navigate('/compte')} className="text-nge-muted hover:text-nge-black transition-colors">Mon compte</button></li>
              <li><button onClick={() => navigate('/commande')} className="text-nge-muted hover:text-nge-black transition-colors">Commander</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-nge-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-nge-muted">© {new Date().getFullYear()} NG Hair. Tous droits réservés.</p>
          <p className="text-xs text-nge-muted">Conçu avec soin, pour toutes les femmes.</p>
        </div>
      </div>
    </footer>
  );
}
