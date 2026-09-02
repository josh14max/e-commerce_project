import { supabase } from './supabase';

export type CatalogOptionType = 'color' | 'size' | 'texture';

export interface CatalogOption {
  id: string;
  type: CatalogOptionType;
  label: string;
  sortOrder: number;
}

const FALLBACK_OPTIONS: Record<CatalogOptionType, string[]> = {
  color: ['Noir', 'Châtain', 'Auburn', 'Brun foncé', 'Blond platine', 'Bordeaux', 'Émeraude', 'Gris argenté', 'Rose', 'Miel'],
  size: ['12', '16', '20', '22', '28', '30', '32'],
  texture: ['Lisse', 'Ondulé', 'Afro', 'Frison', 'Tresses'],
};

export function fallbackCatalogOptions(): CatalogOption[] {
  return (Object.entries(FALLBACK_OPTIONS) as [CatalogOptionType, string[]][]).flatMap(
    ([type, labels]) => labels.map((label, index) => ({
      id: `fallback-${type}-${index}`,
      type,
      label,
      sortOrder: index,
    })),
  );
}

export async function getCatalogOptions(): Promise<CatalogOption[]> {
  const { data, error } = await supabase
    .from('catalog_options')
    .select('id, type, label, sort_order')
    .order('type')
    .order('sort_order')
    .order('label');

  if (error) {
    console.error('getCatalogOptions error:', error.message);
    return fallbackCatalogOptions();
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    type: row.type as CatalogOptionType,
    label: String(row.label),
    sortOrder: Number(row.sort_order),
  }));
}

export async function createCatalogOption(
  type: CatalogOptionType,
  label: string,
): Promise<{ error: string | null }> {
  const normalizedLabel = label.trim();
  const { data: existing } = await supabase
    .from('catalog_options')
    .select('sort_order')
    .eq('type', type)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = existing?.[0] ? Number(existing[0].sort_order) + 1 : 0;
  const { error } = await supabase
    .from('catalog_options')
    .insert({ type, label: normalizedLabel, sort_order: nextOrder });
  return { error: error?.message ?? null };
}

export async function renameCatalogOption(
  id: string,
  label: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('catalog_options')
    .update({ label: label.trim() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteCatalogOption(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('catalog_options').delete().eq('id', id);
  return { error: error?.message ?? null };
}

