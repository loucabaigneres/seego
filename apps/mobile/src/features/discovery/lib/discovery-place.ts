import type { RouterOutputs } from '@/lib/trpc';

/** A place of the swipe deck, as returned by `discovery.feed`. */
export type DiscoveryPlace = RouterOutputs['discovery']['feed'][number];

/** `tags` is an untyped jsonb column: every value is checked before use. */
type Tagged = { tags: { [key: string]: unknown } | null };

/** `tags.category` ("hotel", "activité", "restaurant"…), or null when missing. */
export function placeCategory(place: Tagged): string | null {
  const category = place.tags?.category;
  return typeof category === 'string' && category ? category : null;
}

/** `tags.subcategory`, keeping only the string values. */
export function placeSubcategories(place: Tagged): string[] {
  const subcategories = place.tags?.subcategory;
  if (!Array.isArray(subcategories)) return [];
  return subcategories.filter((value): value is string => typeof value === 'string' && !!value);
}

/** `tags.price` ("€€", "à partir de 80 €"…), or null when missing. */
export function placePrice(place: Tagged): string | null {
  const price = place.tags?.price;
  return typeof price === 'string' && price.trim() ? price.trim() : null;
}
