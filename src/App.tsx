import { useState } from 'react';
import { CartProvider } from '@/lib/cart';
import { AuthProvider } from '@/lib/auth';
import { useRoute } from '@/lib/router';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductDetail from '@/pages/ProductDetail';
import CartPage from '@/pages/CartPage';
import Checkout from '@/pages/Checkout';
import PaymentConfirmation from '@/pages/PaymentConfirmation';
import Account from '@/pages/Account';
import About from '@/pages/About';
import Admin from '@/pages/Admin';

function currentRouteName(route: ReturnType<typeof useRoute>[0]): string {
  return route.name;
}

function App() {
  const [route, navigate] = useRoute();
  const [cartOpen, setCartOpen] = useState(false);
  const current = currentRouteName(route);

  // L'admin a sa propre interface, complètement séparée du site marchand
  // (pas de navbar, pas de bandeau promo, pas de panier).
  if (route.name === 'admin') {
    return (
      <AuthProvider>
        <Admin navigate={navigate} />
      </AuthProvider>
    );
  }

  let page;
  switch (route.name) {
    case 'home':
      page = <Home navigate={navigate} />;
      break;
    case 'wigs':
      page = <Catalog navigate={navigate} category="wigs" />;
      break;
    case 'clothing':
      page = <Catalog navigate={navigate} category="clothing" />;
      break;
    case 'product':
      page = <ProductDetail slug={route.slug} navigate={navigate} />;
      break;
    case 'cart':
      page = <CartPage navigate={navigate} />;
      break;
    case 'checkout':
      page = <Checkout navigate={navigate} />;
      break;
    case 'payment-confirmation':
      page = <PaymentConfirmation navigate={navigate} />;
      break;
    case 'account':
      page = <Account navigate={navigate} />;
      break;
    case 'about':
      page = <About navigate={navigate} />;
      break;
    default:
      page = <Home navigate={navigate} />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar navigate={navigate} currentRoute={current} onOpenCart={() => setCartOpen(true)} />
          <main className="flex-1">{page}</main>
          <Footer navigate={navigate} />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} navigate={navigate} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
