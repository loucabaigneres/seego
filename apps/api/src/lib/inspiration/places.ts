import type { ExtractedPlace } from '@seego/database';

/** Adresse postale si connue, sinon « ville, pays », sinon null. */
export const placeLocation = (place: ExtractedPlace): string | null =>
  place.address ?? ([place.city, place.country].filter(Boolean).join(', ') || null);

/** Résumé court des lieux pour la colonne `extracted_location` (NOT NULL). */
export const summariseLocation = (places: ExtractedPlace[]): string =>
  places
    .slice(0, 3)
    .map((p) => [p.name, p.city].filter(Boolean).join(', '))
    .join(' · ');

// `extracted_tags` / `extracted_places` sont des jsonb : on normalise à la lecture.
export const asPlaces = (value: unknown): ExtractedPlace[] =>
  Array.isArray(value) ? (value as ExtractedPlace[]) : [];

export const asTags = (value: unknown): string[] =>
  Array.isArray(value) ? (value as string[]) : [];
