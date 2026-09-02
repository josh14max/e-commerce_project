export type Category = 'wigs' | 'clothing';

export interface Variant {
  id: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  universe: 'perruques' | 'vetements';
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  images: string[];
  texture?: string;
  length?: string;
  color?: string;
  size?: string;
  colors: string[];
  sizes?: string[];
  lengths?: string[];
  textures?: string[];
  badge?: string;
  profiles: string[];
  featured?: boolean;
  isActive?: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  variantLabel: string;
  variantValue: string;
  quantity: number;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  addressComplement?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  address_complement: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deposit_amount: number;
  status: string;
  moneroo_transaction_id?: string | null;
  payment_provider?: string | null;
  payment_initialized_at?: string | null;
  paid_at?: string | null;
  created_at: string;
}
