import { addDays, formatDate, formatDayMonth, pluralize } from './date';

export type TripStatus = 'draft' | 'finalized' | 'archived';

export interface TripStatusMeta {
  label: string;
  tone: 'neutral' | 'success' | 'brand';
}

const STATUS_META: Record<TripStatus, TripStatusMeta> = {
  draft: { label: 'Brouillon', tone: 'neutral' },
  finalized: { label: 'Finalisé', tone: 'success' },
  archived: { label: 'Archivé', tone: 'brand' },
};

export function tripStatusMeta(status: string | null | undefined): TripStatusMeta {
  return STATUS_META[status as TripStatus] ?? STATUS_META.draft;
}

/** Pills under a trip's title: "12 janv. 2026", "3 jours", "12 étapes" — absent facts are left out. */
export function tripFacts(
  trip: { startDate?: string | null; durationDays?: number | null },
  plannedCount: number,
  month: 'short' | 'long' = 'short',
): string[] {
  return [
    formatDate(trip.startDate, month),
    trip.durationDays ? pluralize(trip.durationDays, 'jour') : '',
    plannedCount > 0 ? pluralize(plannedCount, 'étape') : '',
  ].filter(Boolean);
}

export function tripDisplayTitle(trip: {
  title?: string | null;
  destination?: string | null;
}): string {
  const title = trip.title?.trim();
  if (title) return title;
  const destination = trip.destination?.trim();
  return destination ? `Voyage à ${destination}` : 'Voyage sans destination';
}

/** "Li" for Lisbonne: the two letters printed on a trip's tile, from its destination else title. */
export function tripMonogram(trip: { title: string | null; destination: string | null }): string {
  const source = trip.destination?.trim() || trip.title?.trim() || '';
  // `Array.from` splits by code point, so an accented first letter stays whole.
  const [first = '', second = ''] = Array.from(source);
  return first.toLocaleUpperCase('fr-FR') + second.toLocaleLowerCase('fr-FR');
}

/** "12 – 16 juil.", "28 juil. – 2 août", "12 juil." — empty without a start date. */
export function tripDateRange(trip: {
  startDate?: string | null;
  durationDays?: number | null;
}): string {
  if (!trip.startDate) return '';
  const start = formatDayMonth(trip.startDate);
  if (!trip.durationDays || trip.durationDays < 2) return start;
  const endDate = addDays(trip.startDate, trip.durationDays - 1);
  const end = formatDayMonth(endDate);
  const sameMonth = trip.startDate.slice(0, 7) === endDate.slice(0, 7);
  return `${sameMonth ? start.split(' ')[0] : start} – ${end}`;
}

/** A trip in a picker: "12 – 16 juil. · 13 étapes", else its status ("Brouillon"). */
export function tripPickerDetails(trip: {
  startDate?: string | null;
  durationDays?: number | null;
  stepsCount?: number;
  status?: string | null;
}): string {
  const facts = [
    tripDateRange(trip),
    trip.stepsCount ? pluralize(trip.stepsCount, 'étape') : '',
  ].filter(Boolean);
  return facts.length > 0 ? facts.join(' · ') : tripStatusMeta(trip.status).label;
}
