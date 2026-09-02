import { useState } from 'react';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { link } from '@/lib/router';
import { useSiteSettings } from '@/lib/siteSettings';

interface NavbarProps {
  navigate: (to: string) => void;
  currentRoute: string;
  onOpenCart: () => void;
}

const NAV_LINKS = [
  { label: 'À propos', path: '/a-propos' },
  { label: 'Perruques', path: '/perruques' },
];

export default function Navbar({ navigate, currentRoute, onOpenCart }: NavbarProps) {
  const { count } = useCart();
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);

  const go = (path: string) => { navigate(path); setOpen(false); };
  const isActive = (path: string) => currentRoute === path;

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Ticker */}
      <div className="overflow-hidden bg-nge-black text-white py-2.5">
        <div className="flex whitespace-nowrap ticker-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {settings.header.tickerItems.map((t, i) => (
                <span key={i} className="flex items-center text-[10px] font-medium uppercase tracking-[0.25em] px-8">
                  <span className="mr-3 text-nge-warm">✦</span>{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-nge-line">
        <div className="container-ora">
          <div className="flex h-20 sm:h-24 items-center justify-between">
            {/* Left: mobile menu + logo + nav (desktop) */}
            <div className="flex items-center gap-8 sm:gap-10">
              <button
                onClick={() => setOpen(v => !v)}
                className="md:hidden grid h-10 w-10 place-items-center text-nge-black"
                aria-label="Menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Logo */}
              <button onClick={() => go('/')} className="shrink-0 text-left" aria-label="NG Hair accueil">
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
              </button>

              <nav className="hidden md:flex items-center gap-7">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.path}
                    onClick={() => go(l.path)}
                    className={`text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${
                      isActive(l.path) ? 'text-nge-black' : 'text-nge-muted hover:text-nge-black'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right: account + cart */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={() => go('/compte')}
                className="grid h-10 w-10 place-items-center text-nge-black hover:text-nge-warm transition-colors"
                aria-label="Mon compte"
              >
                <User className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={onOpenCart}
                className="relative grid h-10 w-10 place-items-center text-nge-black hover:text-nge-warm transition-colors"
                aria-label="Mon panier"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-nge-warm px-1 text-[10px] font-medium text-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-b border-nge-line bg-white fade-in">
          <nav className="container-ora py-6 flex flex-col gap-5">
            {NAV_LINKS.map((l) => (
              <button
                key={l.path}
                onClick={() => go(l.path)}
                className={`text-left text-sm font-medium uppercase tracking-[0.2em] ${
                  isActive(l.path) ? 'text-nge-black' : 'text-nge-muted'
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export { link };
