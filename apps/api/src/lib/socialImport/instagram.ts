import { CRAWLER_USER_AGENT, FETCH_TIMEOUT_MS } from './http.js';
import { extractOpenGraphDescription, extractOpenGraphImage } from './openGraph.js';
import { EMPTY_MEDIA, type CaptionResult, type MediaResult } from './types.js';

// L'og:description Instagram est préfixée par les stats d'engagement et l'auteur,
// p.ex. « 728 likes, 53 comments - auteur on December 29, 2024: "<légende>" ».
// On retire le compteur de likes/comments ; si le format ne correspond pas (autre
// langue), on garde la description telle quelle.
const stripInstagramOgPrefix = (caption: string | null): string | null => {
  if (!caption) return null;
  const cleaned = caption.replace(/^[\d.,\s]+likes?,\s*[\d.,\s]+comments?\s*-\s*/i, '').trim();
  return cleaned || null;
};

/**
 * Instagram rend une coquille vide à un UA navigateur depuis une IP serveur, mais sert
 * son aperçu Open Graph (légende + image) à un crawler social. On exploite ce canal,
 * comme pour les posts photo TikTok. Best-effort : contenus privés/age-gated -> vide,
 * d'où le fallback « coller la description » côté UI.
 */
export const fetchInstagramMedia = async (url: string): Promise<MediaResult> => {
  const response = await fetch(url, {
    headers: { 'User-Agent': CRAWLER_USER_AGENT, 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) return EMPTY_MEDIA;

  const html = await response.text();
  const image = extractOpenGraphImage(html);

  return {
    caption: stripInstagramOgPrefix(extractOpenGraphDescription(html)),
    imageUrls: image ? [image] : [],
    transcript: null,
  };
};

/**
 * L'oEmbed officiel d'Instagram exige un token applicatif Meta : on se rabat sur l'aperçu
 * Open Graph servi aux crawlers (cf. `fetchInstagramMedia`). Best-effort — contenus privés
 * ou indisponibles -> `blocked`, d'où le fallback manuel côté UI.
 */
export const fetchInstagramCaption = async (url: string): Promise<CaptionResult> => {
  const { caption } = await fetchInstagramMedia(url);

  if (!caption) return { ok: false, reason: 'blocked' };

  return { ok: true, caption };
};
