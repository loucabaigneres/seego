export const COUNTRY_FLAGS: Record<string, string> = {
  France: '🇫🇷',
  Italie: '🇮🇹',
  Espagne: '🇪🇸',
  Allemagne: '🇩🇪',
  Angleterre: '🇬🇧',
  Portugal: '🇵🇹',
  Grèce: '🇬🇷',
};

export function confidenceLabel(pct: number): string {
  if (pct >= 90) return 'Recommandation fiable';
  if (pct >= 50) return 'Tendance qui se confirme';
  return 'Première tendance';
}
