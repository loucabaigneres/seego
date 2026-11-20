/**
 * Where this visit came from, read once when the app loads (before the router can rewrite the
 * URL) and kept in memory only: nothing is stored on the device until the visitor consents.
 * Sent to PostHog as `first_*` properties when they accept, so funnels can be broken down by
 * source even if they navigated before answering the consent banner.
 */
export interface FirstTouch {
  first_utm_source?: string;
  first_utm_medium?: string;
  first_utm_campaign?: string;
  first_utm_content?: string;
  first_utm_term?: string;
  /** Domain of the referring page only (e.g. `l.instagram.com`), never its full URL. */
  first_referring_domain?: string;
  first_landing_path: string;
}

const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const;

function referringDomain(referrer: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname;
    return host === window.location.hostname ? undefined : host;
  } catch {
    return undefined;
  }
}

function readFirstTouch(): FirstTouch {
  const params = new URLSearchParams(window.location.search);
  const touch: FirstTouch = { first_landing_path: window.location.pathname };
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`)?.trim();
    if (value) touch[`first_utm_${key}`] = value.toLowerCase();
  }
  const domain = referringDomain(document.referrer);
  if (domain) touch.first_referring_domain = domain;
  return touch;
}

export const firstTouch: FirstTouch = readFirstTouch();

export const firstTouchKeys = [
  ...UTM_KEYS.map((key) => `first_utm_${key}` as const),
  'first_referring_domain',
  'first_landing_path',
] as const satisfies readonly (keyof FirstTouch)[];
