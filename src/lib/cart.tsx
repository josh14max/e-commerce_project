import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from './types';

const STORAGE_KEY = 'ng-hair-cart-v1';

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  remove: (productId: string, variantValue: string) => void;
  setQuantity: (productId: string, variantValue: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add: CartContextValue['add'] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.variantValue === item.variantValue);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variantValue === item.variantValue
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const remove: CartContextValue['remove'] = (productId, variantValue) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantValue === variantValue)));
  };

  const setQuantity: CartContextValue['setQuantity'] = (productId, variantValue, quantity) => {
    if (quantity <= 0) {
      remove(productId, variantValue);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantValue === variantValue ? { ...i, quantity } : i
      )
    );
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, add, remove, setQuantity, clear, count, subtotal }),
    [items, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
