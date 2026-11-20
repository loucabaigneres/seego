/**
 * Extrait les hashtags d'une légende. Les tags sont stockés sans le `#`, en minuscules
 * et dédoublonnés — cohérent avec le format déjà utilisé par les seeds.
 */
export const extractHashtags = (caption: string): string[] => {
  const matches = caption.matchAll(/#([\p{L}\p{N}_]+)/gu);
  const tags = new Set<string>();

  for (const match of matches) {
    const tag = match[1]?.toLowerCase();
    if (tag) tags.add(tag);
  }

  return [...tags];
};

/**
 * Retire les hashtags de la légende : ils sont déjà stockés à part dans `extracted_tags`,
 * inutile de les répéter dans la description. Les espaces laissés par la suppression
 * sont recollés, mais les retours à la ligne d'origine sont préservés.
 */
export const stripHashtags = (caption: string): string =>
  caption
    .replace(/#[\p{L}\p{N}_]+/gu, '')
    .replace(/[^\S\n]{2,}/g, ' ') // espaces/tabs multiples, sans toucher aux sauts de ligne
    .replace(/[^\S\n]+\n/g, '\n') // espaces en fin de ligne
    .replace(/\n{3,}/g, '\n\n')
    .trim();
