const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(
      /&([a-z0-9#]+);/gi,
      (entity, name: string) => HTML_ENTITIES[name.toLowerCase()] ?? entity,
    );

export const extractOpenGraphDescription = (html: string): string | null => {
  const match =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i);

  const raw = match?.[1];
  if (!raw) return null;

  return decodeHtmlEntities(raw).trim() || null;
};

export const extractOpenGraphImage = (html: string): string | null => {
  const match =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i);

  const raw = match?.[1];
  if (!raw) return null;

  return decodeHtmlEntities(raw).trim() || null;
};
