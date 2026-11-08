import { Loader2, Plus } from 'lucide-react';

interface TripOption {
  id: string;
  label: string;
}

interface SelectionBarProps {
  count: number;
  trips: TripOption[];
  tripId: string;
  isAdding: boolean;
  onTripChange: (tripId: string) => void;
  onClear: () => void;
  onAdd: () => void;
}

/** Barre d'actions collée en bas : ajoute les publications sélectionnées à un voyage. */
export function SelectionBar({
  count,
  trips,
  tripId,
  isAdding,
  onTripChange,
  onClear,
  onAdd,
}: SelectionBarProps) {
  return (
    <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-line bg-background/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-ink">
          {count} post{count > 1 ? 's' : ''} sélectionné
          {count > 1 ? 's' : ''}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-xs font-semibold text-ink-muted underline underline-offset-2 transition hover:text-brand"
        >
          Effacer
        </button>
      </div>

      {trips.length === 0 ? (
        <span className="text-xs font-medium text-ink-muted">
          Crée d'abord un voyage pour y ajouter ces lieux.
        </span>
      ) : (
        <div className="flex items-center gap-2">
          <select
            value={tripId}
            onChange={(e) => onTripChange(e.target.value)}
            className="max-w-[55vw] cursor-pointer truncate rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand sm:max-w-50"
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!tripId || isAdding}
            onClick={onAdd}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-accent shadow-md shadow-brand/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={3} />
            )}
            Ajouter au voyage
          </button>
        </div>
      )}
    </div>
  );
}
