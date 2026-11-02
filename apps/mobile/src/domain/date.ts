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
