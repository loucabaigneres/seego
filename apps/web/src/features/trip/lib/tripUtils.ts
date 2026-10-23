const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  hotel: { emoji: '🏨', label: 'Hébergement', color: 'rgba(255,77,77,.12)' },
  activité: { emoji: '🗺️', label: 'Activité', color: 'rgba(46,204,113,.12)' },
  restaurant: { emoji: '🍽️', label: 'Restaurant', color: 'rgba(255,160,60,.14)' },
};

export function categoryMeta(cat: string | null) {
  return CATEGORY_META[cat ?? ''] ?? { emoji: '📍', label: cat ?? '', color: 'rgba(0,0,0,.05)' };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function cleanDesc(desc: string): string {
  return desc.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}
