import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FilterBar, { type FilterGroup } from '@/components/FilterBar';
import ProductCard from '@/components/ProductCard';
import {
  getByCategory,
  CLOTHING_SIZES,
  CLOTHING_COLORS,
} from '@/lib/products';
import { fallbackCatalogOptions, getCatalogOptions } from '@/lib/catalogOptions';
import { useSiteSettings } from '@/lib/siteSettings';
import type { Product } from '@/lib/types';

interface CatalogProps {
  navigate: (to: string) => void;
  category: 'wigs' | 'clothing';
}

export default function Catalog({ navigate, category }: CatalogProps) {
  const { settings } = useSiteSettings();
  const [all, setAll] = useState<Product[]>([]);
  const [catalogOptions, setCatalogOptions] = useState(fallbackCatalogOptions());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    getByCategory(category).then((data) => {
      if (active) {
        setAll(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [category]);

  useEffect(() => {
    getCatalogOptions().then(setCatalogOptions);
  }, []);

  const wigOptions = (type: 'texture' | 'size' | 'color') => catalogOptions
    .filter((option) => option.type === type)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((option) => option.label);

  const groups: FilterGroup[] =
    category === 'wigs'
      ? [
          { label: 'Texture', key: 'texture', options: wigOptions('texture') },
          { label: 'Taille', key: 'length', options: wigOptions('size') },
          { label: 'Couleur', key: 'color', options: wigOptions('color') },
        ]
      : [
          { label: 'Taille', key: 'size', options: CLOTHING_SIZES },
          { label: 'Couleur', key: 'color', options: CLOTHING_COLORS },
        ];

  const toggle = (key: string, value: string) => {
    setSelected((prev) => {
      const arr = prev[key] ?? [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const clear = () => setSelected({});

  const filtered = all.filter((p: Product) => {
    return Object.entries(selected).every(([key, values]) => {
      if (!values.length) return true;
      const productValues = (p as unknown as Record<string, string[] | undefined>)[`${key}s`];
      if (productValues && Array.isArray(productValues)) {
        return values.some((v) => productValues.includes(v));
      }
      const single = (p as unknown as Record<string, string | undefined>)[key];
      return values.includes(single ?? '');
    });
  });

  const isWigs = category === 'wigs';

  return (
    <div className="container-ora">
      <PageHeader
        eyebrow={isWigs ? settings.catalog.eyebrow : 'Vêtements'}
        title={isWigs ? settings.catalog.title : 'Mode femme, libre et fluide'}
        subtitle={
          isWigs
            ? settings.catalog.subtitle
            : "Lin, wax, bazin, maille douce — des pièces pensées pour vivre avec vous, au quotidien et en fête."
        }
      />

      <FilterBar
        groups={groups}
        selected={selected}
        onChange={toggle}
        onClear={clear}
        resultCount={filtered.length}
      />

      {loading ? (
        <div className="py-20 text-center text-ora-text-muted">Chargement des produits…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-xl font-light text-ora-text mb-2">Aucun produit ne correspond.</p>
          <p className="text-ora-text-muted mb-5">Essayez d'élargir vos filtres.</p>
          <button onClick={clear} className="btn-outline">Effacer les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 pb-20">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} navigate={navigate} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
