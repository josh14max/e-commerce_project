import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { WIG_TEXTURES, WIG_LENGTHS, WIG_COLORS } from '@/lib/products';
import { createProduct, updateProduct, makeSlug, type ProductFormValues } from '@/lib/adminProducts';
import ImageUploader from './ImageUploader';

interface ProductFormProps {
  product: Product | null; // null = création d'un nouveau produit
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
  texture: WIG_TEXTURES[0],
  colors: [],
  lengths: [],
  badge: '',
  featured: false,
  isActive: true,
};

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        texture: product.texture ?? WIG_TEXTURES[0],
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

  const handleNameChange = (name: string) => {
    setValues((v) => ({
      ...v,
      name,
      slug: slugTouched ? v.slug : makeSlug(name),
    }));
  };

  const toggleFromList = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    if (values.colors.length === 0) {
      setError('Coche au moins une couleur.');
      return;
    }
    if (values.lengths.length === 0) {
      setError('Coche au moins une taille.');
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
          ? 'Ce lien (slug) est déjà utilisé par un autre produit — choisis-en un autre.'
          : `Erreur : ${result.error}`
      );
      return;
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-2xl bg-white sm:rounded-sm shadow-drawer my-0 sm:my-8">
        <div className="flex items-center justify-between px-6 h-16 border-b border-nge-line sticky top-0 bg-white z-10">
          <h2 className="font-display text-lg text-nge-black">
            {product ? 'Modifier l\'article' : 'Nouvel article'}
          </h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center text-nge-muted hover:text-nge-black">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom + slug */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
              Nom de l'article
            </label>
            <input
              type="text"
              required
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Perruque Jade — Ondulée Émeraude"
              className="w-full rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
            />
            <p className="mt-1 text-xs text-nge-muted">
              Lien : /produit/
              <input
                type="text"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setValues((v) => ({ ...v, slug: makeSlug(e.target.value) }));
                }}
                className="inline-block w-56 border-b border-dashed border-nge-line bg-transparent focus:outline-none focus:border-nge-black"
              />
            </p>
          </div>

          {/* Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
                Prix (FCFA)
              </label>
              <input
                type="number"
                required
                min={0}
                value={values.price || ''}
                onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
                className="w-full rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
                Prix barré (optionnel)
              </label>
              <input
                type="number"
                min={0}
                value={values.compareAtPrice ?? ''}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    compareAtPrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="Pour afficher une promo"
                className="w-full rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
              Description courte
            </label>
            <input
              type="text"
              value={values.shortDescription}
              onChange={(e) => setValues((v) => ({ ...v, shortDescription: e.target.value }))}
              placeholder="Affichée sur la carte produit et dans les aperçus de partage"
              className="w-full rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
              Description complète
            </label>
            <textarea
              rows={4}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="w-full rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black resize-none"
            />
          </div>

          {/* Texture */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
              Texture
            </label>
            <select
              value={values.texture}
              onChange={(e) => setValues((v) => ({ ...v, texture: e.target.value }))}
              className="w-full rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black bg-white"
            >
              {WIG_TEXTURES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Couleurs */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-2">
              Couleurs disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {WIG_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setValues((v) => ({ ...v, colors: toggleFromList(v.colors, c) }))}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    values.colors.includes(c)
                      ? 'border-nge-black bg-nge-black text-white'
                      : 'border-nge-line text-nge-text hover:border-nge-black'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tailles */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-2">
              Tailles disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {WIG_LENGTHS.map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setValues((v) => ({ ...v, lengths: toggleFromList(v.lengths, l) }))}
                  className={`h-9 min-w-9 px-3 rounded-full text-xs border transition-colors ${
                    values.lengths.includes(l)
                      ? 'border-nge-black bg-nge-black text-white'
                      : 'border-nge-line text-nge-text hover:border-nge-black'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-1">
              Étiquette (optionnel)
            </label>
            <select
              value={values.badge}
              onChange={(e) => setValues((v) => ({ ...v, badge: e.target.value }))}
              className="w-full rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:outline-none focus:border-nge-black bg-white"
            >
              <option value="">Aucune</option>
              <option value="Nouveau">Nouveau</option>
              <option value="Best-seller">Best-seller</option>
              <option value="Tendance">Tendance</option>
            </select>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-nge-muted mb-2">
              Photos
            </label>
            <ImageUploader images={values.images} onChange={(images) => setValues((v) => ({ ...v, images }))} />
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-nge-text cursor-pointer">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => setValues((v) => ({ ...v, featured: e.target.checked }))}
                className="h-4 w-4"
              />
              Mettre en avant sur l'accueil
            </label>
            <label className="flex items-center gap-2 text-sm text-nge-text cursor-pointer">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              Visible sur le site
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-nge-line text-sm font-medium uppercase tracking-wide hover:border-nge-black"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 rounded-full bg-nge-black text-white text-sm font-medium uppercase tracking-wide disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : product ? 'Enregistrer' : 'Créer l\'article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
