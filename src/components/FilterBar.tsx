import { SlidersHorizontal, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export interface FilterGroup {
  label: string;
  key: string;
  options: string[];
}

interface FilterBarProps {
  groups: FilterGroup[];
  selected: Record<string, string[]>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  resultCount: number;
}

export default function FilterBar({ groups, selected, onChange, onClear, resultCount }: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = Object.values(selected).reduce((sum, arr) => sum + arr.length, 0);

  const renderGroup = (g: FilterGroup) => {
    const active = selected[g.key] ?? [];
    return (
      <div key={g.key} className="min-w-0">
        <p className="eyebrow mb-2">{g.label}</p>
        <div className="flex flex-wrap gap-1.5">
          {g.options.map((opt) => {
            const isOn = active.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onChange(g.key, opt)}
                className={`chip border transition-colors ${
                  isOn
                    ? 'border-ora-text bg-ora-text text-white'
                    : 'border-ora-line bg-transparent text-ora-text hover:border-ora-text'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6">
      {/* Desktop */}
      <div className="hidden md:flex items-start gap-6 flex-wrap">
        {groups.map(renderGroup)}
        <div className="ml-auto flex items-center gap-3 pt-5">
          <span className="text-sm text-ora-text-muted">{resultCount} produit{resultCount > 1 ? 's' : ''}</span>
          {activeCount > 0 && (
            <button onClick={onClear} className="text-xs font-medium uppercase tracking-[0.15em] text-ora-text-muted hover:text-ora-text flex items-center gap-1">
              <X className="h-3.5 w-3.5" /> Effacer
            </button>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="btn-outline py-2.5"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtrer
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ora-text px-1 text-[11px] text-white">
              {activeCount}
            </span>
          )}
        </button>
        <span className="text-sm text-ora-text-muted">{resultCount} produit{resultCount > 1 ? 's' : ''}</span>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-ora-text/40 backdrop-blur-sm fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ora-bg p-5 pb-8 shadow-2xl fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-light text-ora-text tracking-tight">Filtres</h2>
              <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ora-bg-alt">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5">
              {groups.map(renderGroup)}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={onClear} className="btn-outline flex-1">Effacer</button>
              <button onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                Voir {resultCount} produit{resultCount > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { ReactNode };
