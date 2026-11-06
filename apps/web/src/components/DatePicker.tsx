import { useEffect, useId, useRef, useState } from 'react';

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface DatePickerProps {
  /** ISO date (`YYYY-MM-DD`), or an empty string when nothing is picked yet. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable date (ISO). Defaults to today. */
  min?: string;
  placeholder?: string;
  invalid?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

function formatLong(iso: string): string {
  const date = fromIso(iso);
  const label = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Date field with a calendar in the Seego charte (replaces the browser's native picker). */
export function DatePicker({
  value,
  onChange,
  min,
  placeholder = 'Choisis une date',
  invalid = false,
}: DatePickerProps) {
  const today = toIso(new Date());
  const minIso = min ?? today;
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const base = value ? fromIso(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toIso(new Date(year, month, i + 1))),
  ];
  const canGoBack = toIso(new Date(year, month, 0)) >= minIso;
  const shift = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-background p-3 text-left outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${
          invalid ? 'border-brand' : 'border-line-strong'
        }`}
      >
        <span className={value ? 'text-ink' : 'text-ink-muted'}>{value ? formatLong(value) : placeholder}</span>
        <svg className="h-5 w-5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
          <path strokeLinecap="round" d="M3.5 10h17M8 3v4m8-4v4" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choisir une date"
          className="absolute left-0 top-full z-30 mt-2 w-76 max-w-[calc(100vw-3rem)] rounded-card border border-brand/15 bg-surface p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mois précédent"
              disabled={!canGoBack}
              onClick={() => shift(-1)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-brand transition hover:bg-accent disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
            >
              ‹
            </button>
            <span className="text-base font-semibold text-ink" aria-live="polite">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              aria-label="Mois suivant"
              onClick={() => shift(1)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-brand transition hover:bg-accent"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="py-1 text-[11px] font-semibold uppercase text-ink-muted" aria-hidden>
                {d}
              </span>
            ))}
            {cells.map((iso, i) => {
              if (!iso) return <span key={`blank-${i}`} />;
              const disabled = iso < minIso;
              const selected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  aria-label={formatLong(iso)}
                  aria-pressed={selected}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`h-9 cursor-pointer rounded-full text-sm font-medium transition disabled:cursor-default disabled:text-ink-muted/40 ${
                    selected
                      ? 'bg-brand text-accent'
                      : isToday
                        ? 'border border-brand text-brand hover:bg-accent'
                        : 'text-ink hover:bg-accent hover:text-brand disabled:hover:bg-transparent'
                  }`}
                >
                  {Number(iso.slice(8))}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
