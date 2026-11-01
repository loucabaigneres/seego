/**
 * Head tags for the app (app.seego.fr).
 *
 * The marketing site (www.seego.fr) is what we want ranked: pages here are
 * either shallow entry points (home, découverte, onboarding) or private
 * screens that must stay out of the index — hence the `noindex` flag.
 */

export const SITE_URL = 'https://app.seego.fr';
export const SITE_NAME = 'Seego';
export const MARKETING_URL = 'https://www.seego.fr';

const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export const DEFAULT_DESCRIPTION =
  'Swipe les lieux qui te font envie et Seego compose ton itinéraire de voyage jour par jour : hébergements, activités, restaurants et trajets.';

export type SeoOptions = {
  /** Page title, without the “ · Seego” suffix. */
  title: string;
  description?: string;
  /** Canonical path, e.g. `/discovery`. */
  path: string;
  /** Private or duplicate screens: keep them out of search results. */
  noindex?: boolean;
  image?: string;
  /**
   * Emit the canonical link. Only leaf routes should: the router dedupes
   * `meta` tags but not `link` ones, so a canonical on the root route would
   * sit next to the page's own and the two would contradict each other.
   */
  canonical?: boolean;
};

/** Builds the `head` payload of a route (title, description, canonical, social cards). */
export function seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noindex = false,
  image = DEFAULT_IMAGE,
  canonical = true,
}: SeoOptions) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;

  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      {
        name: 'robots',
        content: noindex
          ? 'noindex, nofollow'
          : 'index, follow, max-image-preview:large, max-snippet:-1',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'fr_FR' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Seego — ton itinéraire de voyage en un swipe' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: canonical ? [{ rel: 'canonical', href: url }] : [],
  };
}
