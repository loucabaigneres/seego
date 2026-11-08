import { BROWSER_USER_AGENT, CRAWLER_USER_AGENT, FETCH_TIMEOUT_MS } from './http.js';
import { extractOpenGraphDescription, extractOpenGraphImage } from './openGraph.js';
import { fetchTikTokSubtitles } from './tiktokSubtitles.js';
import { EMPTY_MEDIA, type CaptionResult, type MediaResult } from './types.js';

interface TikTokOembed {
  title?: string;
  thumbnail_url?: string;
}

/**
 * Suit les redirections pour transformer un lien court (`vm.tiktok.com/...`) en URL
 * canonique (`tiktok.com/@compte/video/ID`). L'oEmbed TikTok n'accepte de façon fiable
 * que l'URL canonique : appelé sur un lien court, il renvoie souvent un 400.
 * Best-effort : en cas d'échec, on renvoie l'URL d'origine.
 */
const resolveTikTokUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': BROWSER_USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    // On n'a besoin que de l'URL finale, pas du corps de la page.
    await response.body?.cancel().catch(() => {});

    const finalUrl = response.url || url;
    const parsed = new URL(finalUrl);
    // On retire les paramètres de tracking (`?_r=...&_t=...`) que l'oEmbed digère mal.
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
};

const fetchTikTokOembed = async (canonicalUrl: string): Promise<TikTokOembed | null> => {
  const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`;

  const response = await fetch(oembedUrl, {
    headers: { 'User-Agent': BROWSER_USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  // 400 = contenu non supporté par l'oEmbed (ex. posts /photo/) ; null -> fallback manuel.
  if (!response.ok) return null;

  return (await response.json().catch(() => null)) as TikTokOembed | null;
};

export const fetchTikTokCaption = async (url: string): Promise<CaptionResult> => {
  const data = await fetchTikTokOembed(await resolveTikTokUrl(url));

  // `title` contient la légende complète de la vidéo, hashtags inclus.
  if (!data?.title) return { ok: false, reason: 'not_found' };

  return { ok: true, caption: data.title };
};

// L'og:description TikTok est préfixée « TikTok | » (ou « TikTok · ») : on la retire.
const stripTikTokOgPrefix = (caption: string | null): string | null => {
  if (!caption) return null;
  const cleaned = caption.replace(/^TikTok\s*[|·:]\s*/i, '').trim();
  return cleaned || null;
};

/**
 * Repli pour les contenus sans oEmbed (posts /photo/) : on lit l'aperçu Open Graph
 * servi aux crawlers sociaux. Donne la légende et l'image de couverture (pas tout le
 * carrousel : seule la couverture est exposée côté serveur).
 */
const fetchTikTokPageOg = async (canonicalUrl: string): Promise<MediaResult> => {
  const response = await fetch(canonicalUrl, {
    headers: { 'User-Agent': CRAWLER_USER_AGENT, 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) return EMPTY_MEDIA;

  const html = await response.text();
  const image = extractOpenGraphImage(html);

  return {
    caption: stripTikTokOgPrefix(extractOpenGraphDescription(html)),
    imageUrls: image ? [image] : [],
    transcript: null,
  };
};

export const fetchTikTokMedia = async (url: string): Promise<MediaResult> => {
  const canonicalUrl = await resolveTikTokUrl(url);
  const data = await fetchTikTokOembed(canonicalUrl);

  if (data?.title || data?.thumbnail_url) {
    return {
      caption: data.title?.trim() || null,
      imageUrls: data.thumbnail_url ? [data.thumbnail_url] : [],
      // La vidéo nomme souvent des lieux à l'oral : on récupère la transcription.
      transcript: await fetchTikTokSubtitles(canonicalUrl),
    };
  }

  // Pas d'oEmbed exploitable (ex. post photo) : on tente l'aperçu Open Graph.
  return fetchTikTokPageOg(canonicalUrl);
};
