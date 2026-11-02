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
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#555] transition hover:border-[#FF4D4D] [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4" />
        Filtrer par type
        {selected.size > 0 && (
          <span className="rounded-full bg-[#FF4D4D] px-1.5 text-xs font-bold text-white">
            {selected.size}
          </span>
        )}
      </summary>
      <div className="absolute z-20 mt-2 w-52 space-y-1 rounded-2xl border border-[#eee] bg-white p-2 shadow-lg">
        {TYPE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-[#1a1a1a] hover:bg-[#f6f3f0]"
          >
            <input
              type="checkbox"
              checked={selected.has(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="h-4 w-4 accent-[#FF4D4D]"
            />
            {opt.label}
          </label>
        ))}
        {selected.size > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="w-full cursor-pointer rounded-xl px-2 py-1.5 text-left text-xs font-semibold text-[#888] hover:bg-[#f6f3f0] hover:text-[#FF4D4D]"
          >
            Tout afficher
          </button>
        )}
      </div>
    </details>
  );
}
