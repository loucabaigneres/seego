// Combining accents left by NFD, as escapes so formatters keep them readable.
const ACCENTS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Lowercase, without accents: "Hôtel Été" → "hotel ete". */
function fold(text: string): string {
  return text.normalize('NFD').replace(ACCENTS, '').toLowerCase();
}

/**
 * Whether every word of the query appears in one of the fields, ignoring case and accents.
 * An empty query matches everything.
 */
export function matchesSearch(
  query: string,
  fields: readonly (string | null | undefined)[],
): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fold(fields.filter(Boolean).join(' '));
  return words.every((word) => haystack.includes(word));
}
