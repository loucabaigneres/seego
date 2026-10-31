import type { DiscoveryItem } from '../types';

export const CATEGORY_LABELS: Record<string, string> = {
  hotel: 'Hébergement',
  activité: 'Activité',
  restaurant: 'Restaurant',
};

export function cleanDesc(desc: string | null): string {
  return (desc ?? '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

export function subcategories(item: DiscoveryItem): string[] {
  const subcategory = item.tags?.subcategory;
  if (!Array.isArray(subcategory)) return [];
  return subcategory.filter((value): value is string => typeof value === 'string');
}

export function category(item: DiscoveryItem): string | null {
  const value = item.tags?.category;
  return typeof value === 'string' ? value : null;
}

export function photosOf(item: DiscoveryItem): string[] {
  return [item.mainMediaUrl, ...(item.carousselUrls ?? [])].filter(
    (url, index, all): url is string => !!url && all.indexOf(url) === index,
  );
}

export function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
