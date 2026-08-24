import { supabase } from './supabase';
import type { Product } from './types';

export interface ProductFormValues {
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  shortDescription: string;
  description: string;
  images: string[];
  texture: string;
  colors: string[];
  lengths: string[];
  badge: string;
  featured: boolean;
  isActive: boolean;
}

export function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toDbRow(values: ProductFormValues) {
  return {
    id: values.slug,
    slug: values.slug,
    name: values.name,
    category: 'wigs',
    universe: 'perruques',
    price: values.price,
    compare_at_price: values.compareAtPrice,
    short_description: values.shortDescription,
    description: values.description,
    images: values.images,
    texture: values.texture || null,
    length: values.lengths[0] ?? null,
    color: values.colors[0] ?? null,
    colors: values.colors,
    lengths: values.lengths,
    textures: values.texture ? [values.texture] : [],
    badge: values.badge || null,
    profiles: [],
    featured: values.featured,
    is_active: values.isActive,
  };
}

export async function createProduct(values: ProductFormValues): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').insert(toDbRow(values));
  return { error: error ? error.message : null };
}

export async function updateProduct(
  originalSlug: string,
  values: ProductFormValues
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').update(toDbRow(values)).eq('slug', originalSlug);
  return { error: error ? error.message : null };
}

export async function deleteProduct(slug: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').delete().eq('slug', slug);
  return { error: error ? error.message : null };
}

// Récupère TOUS les produits (actifs et masqués) pour la liste admin —
// contrairement aux fonctions de products.ts, qui ne montrent que ceux visibles publiquement.
export async function getAllProductsForAdmin(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error('getAllProductsForAdmin error:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    universe: row.universe,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    images: row.images ?? [],
    texture: row.texture ?? undefined,
    length: row.length ?? undefined,
    color: row.color ?? undefined,
    colors: row.colors ?? [],
    lengths: row.lengths ?? [],
    textures: row.textures ?? [],
    badge: row.badge ?? undefined,
    profiles: row.profiles ?? [],
    featured: row.featured ?? false,
    isActive: row.is_active ?? true,
  }));
}

export async function uploadProductImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
