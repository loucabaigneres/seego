import { matchesSearch } from '@/domain/search';

export type PlatformFilter = 'tiktok' | 'instagram';
export type TypeFilter = 'restaurant' | 'hotel' | 'activité';
export type SortOrder = 'recent' | 'oldest';

export const PLATFORM_FILTERS: readonly { value: PlatformFilter; label: string }[] = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
];

export const TYPE_FILTERS: readonly { value: TypeFilter; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'activité', label: 'Activité' },
];

export const SORT_ORDERS: readonly { value: SortOrder; label: string }[] = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'oldest', label: 'Plus anciennes' },
];

export interface InspirationFilters {
  query: string;
  platform: PlatformFilter | null;
  /** Any of these types (empty: all). */
  types: TypeFilter[];
  /** Any of these cities (empty: all). */
  cities: string[];
  sort: SortOrder;
}

export const NO_FILTERS: InspirationFilters = {
  query: '',
  platform: null,
  types: [],
  cities: [],
  sort: 'recent',
};

interface FilterableInspiration {
  platform: string | null;
  type: string | null;
  description: string | null;
  aiReport: string | null;
  city: string | null;
  tags: readonly string[];
  /** Missing dates sort as the oldest. */
  createdAt: string | Date | null;
  extractedPlaces: readonly {
    name: string;
    city: string | null;
    country: string | null;
    category: string | null;
  }[];
}

/** The post's city and its places' cities, trimmed and without empties. */
function citiesOf(item: FilterableInspiration): string[] {
  return [item.city, ...item.extractedPlaces.map((p) => p.city)]
    .map((city) => city?.trim())
    .filter((city): city is string => !!city);
}

const sameCity = (a: string, b: string) => a.localeCompare(b, 'fr', { sensitivity: 'base' }) === 0;

/**
 * Inspirations matching every filter, in the chosen order. A type or a city matches the post
 * itself or one of its places; the search looks at the text, the hashtags and the places.
 */
export function filterInspirations<T extends FilterableInspiration>(
  inspirations: readonly T[],
  { query, platform, types, cities, sort }: InspirationFilters,
): T[] {
  const matching = inspirations.filter(
    (item) =>
      (!platform || item.platform === platform) &&
      (types.length === 0 ||
        types.some(
          (type) => item.type === type || item.extractedPlaces.some((p) => p.category === type),
        )) &&
      (cities.length === 0 ||
        citiesOf(item).some((city) => cities.some((picked) => sameCity(city, picked)))) &&
      matchesSearch(query, [
        item.description,
        item.aiReport,
        item.city,
        ...item.tags,
        ...item.extractedPlaces.flatMap((p) => [p.name, p.city, p.country]),
      ]),
  );
  const direction = sort === 'recent' ? -1 : 1;
  return matching.sort(
    (a, b) =>
      direction * (new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()),
  );
}

/** Every city found in the inspirations, most frequent first, spelled as first seen. */
export function cityOptions(inspirations: readonly FilterableInspiration[]): string[] {
  const counts = new Map<string, number>();
  for (const item of inspirations) {
    // Once per inspiration, even if several of its places are in that city.
    const seen: string[] = [];
    for (const city of citiesOf(item)) {
      if (seen.some((other) => sameCity(other, city))) continue;
      seen.push(city);
      const known = [...counts.keys()].find((other) => sameCity(other, city)) ?? city;
      counts.set(known, (counts.get(known) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, 'fr'))
    .map(([city]) => city);
}

/** How many filters are on (the search and the order don't count: they show elsewhere). */
export function activeFilterCount({ platform, types, cities }: InspirationFilters): number {
  return (platform ? 1 : 0) + types.length + cities.length;
}

export function hasActiveFilter(filters: InspirationFilters): boolean {
  return !!filters.query.trim() || activeFilterCount(filters) > 0;
}

/** Adds the value if absent, removes it otherwise. */
export function toggle<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}
