const LOCALE = 'fr-FR';

/** "12 janv. 2026" (`short`, default) or "12 janvier 2026" (`long`). */
export function formatDate(
  value: string | Date | null | undefined,
  month: 'short' | 'long' = 'short',
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month, year: 'numeric' });
}

/** "12 janv." — for compact labels where the year is obvious. */
export function formatDayMonth(value: string | null | undefined): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

/** "octobre 2026" — e.g. "Membre depuis octobre 2026". */
export function formatMonthYear(value: string | Date | null | undefined): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}

/** `YYYY-MM-DD` in local time: `toISOString()` is UTC and can shift the day near midnight. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local midnight of a `YYYY-MM-DD` day (`new Date('YYYY-MM-DD')` would be UTC midnight). */
export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "1 jour", "3 jours" — French pluralisation for counted nouns. */
export function pluralize(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

const DAY_MS = 86_400_000;
/** UTC midnight of a `YYYY-MM-DD` day: day arithmetic without daylight-saving shifts. */
const utcDay = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

/** Adds `days` to a `YYYY-MM-DD` day. */
export function addDays(iso: string, days: number): string {
  return new Date(utcDay(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Days of a trip from `startDate` to `endDate` (`YYYY-MM-DD`), both included. */
export function tripDurationDays(startDate: string, endDate: string): number {
  return Math.round((utcDay(endDate) - utcDay(startDate)) / DAY_MS) + 1;
}
