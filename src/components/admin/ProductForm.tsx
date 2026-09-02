import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Product } from '@/lib/types';
import {
  fallbackCatalogOptions,
  getCatalogOptions,
  type CatalogOptionType,
} from '@/lib/catalogOptions';
import { createProduct, updateProduct, makeSlug, type ProductFormValues } from '@/lib/adminProducts';
import ImageUploader from './ImageUploader';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const emptyValues: ProductFormValues = {
  slug: '',
  name: '',
  price: 0,
  compareAtPrice: null,
  shortDescription: '',
  description: '',
  images: [],
  textures: [],
  colors: [],
  lengths: [],
  badge: '',
  featured: false,
  isActive: true,
};

interface OptionPillsProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

function OptionPills({ label, options, selected, onChange }: OptionPillsProps) {
  const visibleOptions = [...new Set([...options, ...selected])];
  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-nge-muted">{label}</label>
      <div className="flex flex-wrap gap-2">
        {visibleOptions.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={`min-h-10 rounded-full border px-3 py-2 text-xs transition-colors ${
              selected.includes(option)
                ? 'border-nge-black bg-nge-black text-white'
                : 'border-nge-line text-nge-black hover:border-nge-black'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {visibleOptions.length === 0 && (
        <p className="text-sm text-nge-muted">Ajoute d'abord des options dans l'onglet Variantes.</p>
      )}
    </div>
  );
}

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [catalogOptions, setCatalogOptions] = useState(fallbackCatalogOptions());
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    getCatalogOptions().then(setCatalogOptions);
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (product) {
      setValues({
        slug: product.slug,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        shortDescription: product.shortDescription,
        description: product.description,
        images: product.images,
        textures: product.textures?.length ? product.textures : product.texture ? [product.texture] : [],
        colors: product.colors,
        lengths: product.lengths ?? [],
        badge: product.badge ?? '',
        featured: product.featured ?? false,
        isActive: product.isActive ?? true,
      });
      setSlugTouched(true);
    } else {
      setValues(emptyValues);
      setSlugTouched(false);
    }
  }, [product]);

  const optionsByType = useMemo(() => {
    const labels = (type: CatalogOptionType) => catalogOptions
      .filter((option) => option.type === type)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((option) => option.label);
    return { color: labels('color'), size: labels('size'), texture: labels('texture') };
  }, [catalogOptions]);

  const handleNameChange = (name: string) => {
    setValues((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : makeSlug(name),
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!values.name.trim() || !values.slug.trim()) {
      setError('Le nom et le lien (slug) sont obligatoires.');
      return;
    }
    if (values.price <= 0) {
      setError('Le prix doit être supérieur à 0.');
      return;
    }
    if (values.images.length === 0) {
      setError('Ajoute au moins une photo.');
      return;
    }
    if (values.colors.length === 0 || values.lengths.length === 0 || values.textures.length === 0) {
      setError('Choisis au moins une couleur, une taille et une texture.');
      return;
    }

    setSaving(true);
    const result = product
      ? await updateProduct(product.slug, values)
      : await createProduct(values);
    setSaving(false);
    if (result.error) {
      setError(
        result.error.includes('duplicate') || result.error.includes('unique')
          ? 'Ce lien est déjà utilisé par un autre produit.'
          : `Erreur : ${result.error}`,
      );
      return;
    }
    onSaved();
  };

  const inputClass = 'w-full rounded-sm border border-nge-line px-3 py-3 text-base focus:border-nge-black focus:outline-none';
  const labelClass = 'mb-1 block text-xs font-medium uppercase tracking-wide text-nge-muted';

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center overflow-hidden bg-black/45 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-drawer sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl sm:rounded-sm"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-nge-line bg-white px-4 sm:px-6">
          <h2 id="product-form-title" className="font-display text-xl text-nge-black">
            {product ? "Modifier l'article" : 'Nouvel article'}
          </h2>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center text-nge-muted hover:text-nge-black" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <div>
              <label className={labelClass}>Nom de l'article</label>
              <input type="text" required value={values.name} onChange={(event) => handleNameChange(event.target.value)} placeholder="Perruque Jade — Ondulée Émeraude" className={inputClass} />
              <div className="mt-2 flex flex-col gap-1 text-xs text-nge-muted sm:flex-row sm:items-center">
                <span>Lien : /produit/</span>
                <input
                  aria-label="Lien de l'article"
                  type="text"
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setValues((current) => ({ ...current, slug: makeSlug(event.target.value) }));
                  }}
                  className="min-w-0 flex-1 border-b border-dashed border-nge-line bg-transparent py-1 text-nge-black focus:border-nge-black focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Prix (FCFA)</label>
                <input type="number" required min={0} value={values.price || ''} onChange={(event) => setValues((current) => ({ ...current, price: Number(event.target.value) }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Prix barré (optionnel)</label>
                <input
                  type="number"
                  min={0}
                  value={values.compareAtPrice ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, compareAtPrice: event.target.value ? Number(event.target.value) : null }))}
                  placeholder="Pour afficher une promotion"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description courte</label>
              <input type="text" value={values.shortDescription} onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description complète</label>
              <textarea rows={5} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} className={`${inputClass} resize-y`} />
            </div>

            <OptionPills label="Textures disponibles" options={optionsByType.texture} selected={values.textures} onChange={(textures) => setValues((current) => ({ ...current, textures }))} />
            <OptionPills label="Couleurs disponibles" options={optionsByType.color} selected={values.colors} onChange={(colors) => setValues((current) => ({ ...current, colors }))} />
            <OptionPills label="Tailles disponibles" options={optionsByType.size} selected={values.lengths} onChange={(lengths) => setValues((current) => ({ ...current, lengths }))} />

            <div>
              <label className={labelClass}>Étiquette (optionnel)</label>
              <select value={values.badge} onChange={(event) => setValues((current) => ({ ...current, badge: event.target.value }))} className={`${inputClass} bg-white`}>
                <option value="">Aucune</option>
                <option value="Nouveau">Nouveau</option>
                <option value="Best-seller">Best-seller</option>
                <option value="Tendance">Tendance</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-nge-muted">Photos</label>
              <ImageUploader images={values.images} onChange={(images) => setValues((current) => ({ ...current, images }))} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-nge-black">
                <input type="checkbox" checked={values.featured} onChange={(event) => setValues((current) => ({ ...current, featured: event.target.checked }))} className="h-5 w-5" />
                Mettre en avant sur l'accueil
              </label>
              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-nge-black">
                <input type="checkbox" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} className="h-5 w-5" />
                Visible sur le site
              </label>
            </div>
            {error && <p role="alert" className="rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-nge-line bg-white p-4 sm:px-6">
            <button type="button" onClick={onClose} className="h-12 rounded-full border border-nge-line text-xs font-medium uppercase tracking-wide hover:border-nge-black">Annuler</button>
            <button type="submit" disabled={saving} className="h-12 rounded-full bg-nge-black text-xs font-medium uppercase tracking-wide text-white disabled:opacity-60">
              {saving ? 'Enregistrement…' : product ? 'Enregistrer' : "Créer l'article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

