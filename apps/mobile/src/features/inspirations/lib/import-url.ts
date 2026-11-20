// shortcut: same host list as apps/api/src/lib/socialImport/url.ts, move to the shared package (step 11).
const SUPPORTED_HOSTS = [
  'tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'm.tiktok.com',
  'instagram.com',
  'instagr.am',
  'ig.me',
];

function isSupportedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return SUPPORTED_HOSTS.some(
      (supported) => host === supported || host.endsWith(`.${supported}`),
    );
  } catch {
    return false;
  }
}

/**
 * The first TikTok or Instagram link found in a pasted or shared text
 * (apps share "Regarde cette vidéo… https://vm.tiktok.com/ZM…/"), or null.
 */
export function extractSupportedUrl(text: string): string | null {
  const links = text.match(/https?:\/\/[^\s<>"']+/gi) ?? [];
  for (const link of links) {
    const url = link.replace(/[.,;:!?)\]»]+$/, '');
    if (isSupportedHost(url)) return url;
  }
  return null;
}

/** Why the text can't be analysed, or null when it holds a supported link. */
export function importUrlError(text: string): string | null {
  if (extractSupportedUrl(text)) return null;
  if (!text.trim()) return 'Colle le lien d’une vidéo TikTok ou Instagram.';
  return 'Seuls les liens TikTok et Instagram sont pris en charge pour le moment.';
}

/**
 * The supported link copied to the clipboard, unless it was already offered: each copied link
 * is suggested once per session, whatever the user answered.
 */
export function clipboardSuggestion(
  text: string,
  alreadyOffered: ReadonlySet<string>,
): string | null {
  const url = extractSupportedUrl(text);
  return url && !alreadyOffered.has(url) ? url : null;
}
