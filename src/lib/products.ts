import type { Product } from './types';
import { supabase } from './supabase';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

export const FREE_SHIPPING_THRESHOLD = 30000;
export const SHIPPING_COST = 3000;

// Les produits vivent désormais dans Supabase (table `products`), plus dans ce fichier.
// Ces fonctions remplacent l'ancien tableau statique par de vraies requêtes à la base.
// Elles sont asynchrones : chaque écran qui les appelle doit gérer un état de chargement
// (voir Home.tsx, Catalog.tsx, ProductDetail.tsx pour le pattern utilisé).

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  universe: string;
  price: number;
  compare_at_price: number | null;
  short_description: string;
  description: string;
  images: string[];
  texture: string | null;
  length: string | null;
  color: string | null;
  colors: string[];
  lengths: string[];
  textures: string[];
  badge: string | null;
  profiles: string[];
  featured: boolean;
};

function mapDbProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as Product['category'],
    universe: row.universe as Product['universe'],
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    shortDescription: row.short_description,
    description: row.description,
    images: row.images ?? [],
    texture: row.texture ?? undefined,
    length: row.length ?? undefined,
    color: row.color ?? undefined,
    colors: row.colors ?? [],
    lengths: row.lengths ?? [],
    textures: row.textures ?? [],
    badge: row.badge ?? undefined,
    profiles: row.profiles ?? [],
    featured: row.featured,
  };
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('getProduct error:', error.message);
    return undefined;
  }
  return data ? mapDbProduct(data as ProductRow) : undefined;
}

export async function getFeatured(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getFeatured error:', error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapDbProduct);
}

export async function getByCategory(category: 'wigs' | 'clothing'): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getByCategory error:', error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapDbProduct);
}

export const WIG_TEXTURES = ['Lisse', 'Ondulé', 'Afro', 'Frison', 'Tresses'];
export const WIG_LENGTHS = ['12', '16', '20', '22', '28', '30', '32'];

// Supplément ajouté au prix de base selon la taille choisie (en FCFA).
// Plus la taille est grande, plus le supplément est élevé — ajustable ici,
// un seul endroit pour toutes les perruques du site.
export const SIZE_PRICE_SUPPLEMENT: Record<string, number> = {
  '12': 0,
  '16': 2000,
  '20': 4000,
  '22': 6000,
  '28': 9000,
  '30': 11000,
  '32': 13000,
};

export function getPriceForSize(basePrice: number, size?: string): number {
  if (!size) return basePrice;
  return basePrice + (SIZE_PRICE_SUPPLEMENT[size] ?? 0);
}
export const WIG_COLORS = ['Noir', 'Châtain', 'Auburn', 'Brun foncé', 'Blond platine', 'Bordeaux', 'Émeraude', 'Gris argenté', 'Rose', 'Miel'];
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const CLOTHING_COLORS = [
  'Fauve',
  'Écru',
  'Vert sauge',
  'Sable',
  'Noir',
  'Terracotta',
  'Émeraude',
  'Bordeaux',
  'Indigo',
  'Terre',
  'Cuivre',
  'Multicolore',
  'Poudre',
];
