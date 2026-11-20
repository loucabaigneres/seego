import { formatDate, pluralize } from './date';

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
