import type { RouterOutputs } from '@/lib/trpc';

export type Inspiration = RouterOutputs['inspiration']['listMine'][number];
export type ExtractedPlace = Inspiration['extractedPlaces'][number];

// Types proposés au filtre (alignés sur le champ `type` renvoyé par l'IA).
export const TYPE_OPTIONS = [
  { value: 'hotel', label: 'Hôtel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'activité', label: 'Activité' },
] as const;

export const typeLabel = (type: string | null): string =>
  TYPE_OPTIONS.find((o) => o.value === type)?.label ?? '';

// Un titre lisible à partir de l'analyse, à la place de l'URL brute.
export function inspirationTitle(item: Inspiration): string {
  if (item.extractedPlaces.length > 0) {
    const first = item.extractedPlaces[0]!.name;
    return item.extractedPlaces.length > 1 ? `${first} +${item.extractedPlaces.length - 1}` : first;
  }
  if (item.aiReport) {
    return item.aiReport.length > 60 ? `${item.aiReport.slice(0, 60).trimEnd()}…` : item.aiReport;
  }
  return item.platform === 'tiktok' ? 'Publication TikTok' : 'Publication Instagram';
}

/** Adresse du lieu, à défaut « ville, pays », à défaut chaîne vide. */
export function placeLocation(place: ExtractedPlace): string {
  if (place.address) return place.address;
  return [place.city, place.country].filter(Boolean).join(', ');
}

/** Copie du set avec `value` ajouté s'il est absent, retiré sinon. */
export function toggleInSet<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
