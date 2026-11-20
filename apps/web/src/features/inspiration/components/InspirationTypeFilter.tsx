import { ChevronDown } from 'lucide-react';
import { TYPE_OPTIONS } from '../lib/inspiration';

interface InspirationTypeFilterProps {
  selected: ReadonlySet<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
}

/** Filtre par type (dropdown multi-sélection). */
export function InspirationTypeFilter({ selected, onToggle, onClear }: InspirationTypeFilterProps) {
  return (
    <details className="relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-brand [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4" />
        Filtrer par type
        {selected.size > 0 && (
          <span className="rounded-full bg-brand px-1.5 text-xs font-bold text-accent">
            {selected.size}
          </span>
        )}
      </summary>
      <div className="absolute z-20 mt-2 w-52 space-y-1 rounded-card border border-brand/15 bg-surface p-2 shadow-lg">
        {TYPE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-ink hover:bg-background"
          >
            <input
              type="checkbox"
              checked={selected.has(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="h-4 w-4 accent-brand"
            />
            {opt.label}
          </label>
        ))}
        {selected.size > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="w-full cursor-pointer rounded-xl px-2 py-1.5 text-left text-xs font-semibold text-ink-muted hover:bg-background hover:text-brand"
          >
            Tout afficher
          </button>
        )}
      </div>
    </details>
  );
}
