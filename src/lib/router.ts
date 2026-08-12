import { useEffect, useState } from 'react';

// Adresse d'accès au panneau d'administration — volontairement non devinable,
// à communiquer directement à l'admin (jamais de lien visible sur le site public).
export const ADMIN_PATH = 'gestioncommerce_totale_ngh';

export type Route =
  | { name: 'home' }
  | { name: 'wigs' }
  | { name: 'clothing' }
  | { name: 'product'; slug: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'payment-confirmation' }
  | { name: 'account' }
  | { name: 'about' }
  | { name: 'admin' }
  | { name: 'admin-reset' };

function parse(pathname: string): Route {
  const clean = pathname.replace(/^\/+/, '').trim();
  if (!clean) return { name: 'home' };
  const [path, ...rest] = clean.split('/');
  const param = rest.join('/');
  switch (path) {
    case 'perruques':
      return { name: 'wigs' };
    case 'vetements':
      return { name: 'wigs' };
    case 'produit':
      return { name: 'product', slug: decodeURIComponent(param) };
    case 'panier':
      return { name: 'cart' };
    case 'commande':
      return { name: 'checkout' };
    case 'paiement':
      if (param.startsWith('confirmation')) return { name: 'payment-confirmation' };
      return { name: 'checkout' };
    case 'compte':
      return { name: 'account' };
    case 'a-propos':
      return { name: 'about' };
    case ADMIN_PATH:
      if (param.startsWith('reset-password')) return { name: 'admin-reset' };
      return { name: 'admin' };
    default:
      return { name: 'home' };
  }
}

export function useRoute(): [Route, (to: string) => void] {
  const [route, setRoute] = useState<Route>(() => parse(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setRoute(parse(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    if (window.location.pathname === target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', target);
    setRoute(parse(target));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return [route, navigate];
}

export function link(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}