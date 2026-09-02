import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createCatalogOption,
  deleteCatalogOption,
  getCatalogOptions,
  renameCatalogOption,
  type CatalogOption,
  type CatalogOptionType,
} from '@/lib/catalogOptions';

const GROUPS: { type: CatalogOptionType; title: string; description: string }[] = [
  { type: 'color', title: 'Couleurs', description: 'Disponibles dans les fiches articles et les filtres.' },
  { type: 'size', title: 'Tailles', description: 'Longueurs proposées pour les perruques.' },
  { type: 'texture', title: 'Textures', description: 'Une ou plusieurs textures peuvent être liées à un article.' },
];

export default function CatalogOptionsManager() {
  const [options, setOptions] = useState<CatalogOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabels, setNewLabels] = useState<Record<CatalogOptionType, string>>({ color: '', size: '', texture: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setOptions(await getCatalogOptions());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => Object.fromEntries(
    GROUPS.map(({ type }) => [type, options.filter((option) => option.type === type)]),
  ) as Record<CatalogOptionType, CatalogOption[]>, [options]);

  const add = async (event: FormEvent, type: CatalogOptionType) => {
    event.preventDefault();
    const label = newLabels[type].trim();
    if (!label) return;
    setBusy(`add-${type}`);
    setMessage(null);
    const result = await createCatalogOption(type, label);
    setBusy(null);
    if (result.error) {
      setMessage(`Impossible d'ajouter cette option : ${result.error}`);
      return;
    }
    setNewLabels((current) => ({ ...current, [type]: '' }));
    await load();
  };

  const saveRename = async (option: CatalogOption) => {
    const label = editingLabel.trim();
    if (!label || label === option.label) {
      setEditingId(null);
      return;
    }
    setBusy(option.id);
    setMessage(null);
    const result = await renameCatalogOption(option.id, label);
    setBusy(null);
    if (result.error) {
      setMessage(`Impossible de renommer cette option : ${result.error}`);
      return;
    }
    setEditingId(null);
    setMessage('Option renommée sur tous les articles concernés.');
    await load();
  };

  const remove = async (option: CatalogOption) => {
    if (!confirm(`Supprimer « ${option.label} » des options et de tous les articles ?`)) return;
    setBusy(option.id);
    setMessage(null);
    const result = await deleteCatalogOption(option.id);
    setBusy(null);
    if (result.error) {
      setMessage(`Impossible de supprimer cette option : ${result.error}`);
      return;
    }
    setMessage('Option supprimée de tous les articles concernés.');
    await load();
  };

  if (loading) return <p className="text-sm text-nge-muted">Chargement des variantes…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-nge-black">Variantes du catalogue</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-nge-muted">
          Une modification ou une suppression est répercutée sur tous les articles qui utilisent l'option.
        </p>
      </div>

      {message && <p className="rounded-sm bg-nge-bg-alt p-3 text-sm text-nge-black">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        {GROUPS.map((group) => (
          <section key={group.type} className="rounded-sm border border-nge-line bg-white p-4 sm:p-5">
            <h3 className="font-display text-xl text-nge-black">{group.title}</h3>
            <p className="mb-5 mt-1 min-h-10 text-sm text-nge-muted">{group.description}</p>

            <form onSubmit={(event) => add(event, group.type)} className="mb-5 flex gap-2">
              <input
                type="text"
                value={newLabels[group.type]}
                onChange={(event) => setNewLabels((current) => ({ ...current, [group.type]: event.target.value }))}
                placeholder={`Nouvelle ${group.title.toLowerCase().slice(0, -1)}`}
                className="min-w-0 flex-1 rounded-sm border border-nge-line px-3 py-2.5 text-sm focus:border-nge-black focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy === `add-${group.type}`}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-nge-black text-white disabled:opacity-50"
                aria-label={`Ajouter une option ${group.title.toLowerCase()}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="divide-y divide-nge-line border-y border-nge-line">
              {grouped[group.type].map((option) => (
                <div key={option.id} className="flex min-h-14 items-center gap-2 py-2">
                  {editingId === option.id ? (
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={(event) => setEditingLabel(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveRename(option);
                        if (event.key === 'Escape') setEditingId(null);
                      }}
                      className="min-w-0 flex-1 rounded-sm border border-nge-black px-2 py-2 text-sm focus:outline-none"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm text-nge-black">{option.label}</span>
                  )}

                  {editingId === option.id ? (
                    <>
                      <button type="button" onClick={() => saveRename(option)} disabled={busy === option.id} className="grid h-10 w-10 place-items-center text-nge-black" aria-label="Enregistrer"><Check className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setEditingId(null)} className="grid h-10 w-10 place-items-center text-nge-muted" aria-label="Annuler"><X className="h-4 w-4" /></button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => { setEditingId(option.id); setEditingLabel(option.label); }} className="grid h-10 w-10 place-items-center text-nge-muted hover:text-nge-black" aria-label={`Modifier ${option.label}`}><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => remove(option)} disabled={busy === option.id} className="grid h-10 w-10 place-items-center text-nge-muted hover:text-red-600 disabled:opacity-50" aria-label={`Supprimer ${option.label}`}><Trash2 className="h-4 w-4" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

