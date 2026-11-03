/**
 * Récupération des légendes de contenus TikTok / Instagram et extraction des hashtags.
 *
 * Volontairement sans dépendance à la base de données ni à tRPC : ces fonctions sont
 * pures (hormis les appels réseau) et testables isolément.
 *
 * Organisation : `url` (détection/normalisation), `hashtags`, `openGraph` (parsing HTML),
 * `tiktok` + `tiktokSubtitles`, `instagram` et `image` ; ce fichier n'orchestre que les
 * deux points d'entrée par plateforme.
 */
import { fetchInstagramCaption, fetchInstagramMedia } from './instagram.js';
import { fetchTikTokCaption, fetchTikTokMedia } from './tiktok.js';
import { EMPTY_MEDIA, type CaptionResult, type MediaResult } from './types.js';
import { detectPlatform } from './url.js';

export { extractHashtags, stripHashtags } from './hashtags.js';
export { downloadImageAsInline } from './image.js';
export { extractOpenGraphDescription, extractOpenGraphImage } from './openGraph.js';
export type { CaptionResult, MediaResult, Platform } from './types.js';
export { detectPlatform, normalizeContentUrl } from './url.js';

/**
 * Ne lève jamais : renvoie ce qu'on a pu obtenir (éventuellement vide), à charge
 * pour l'appelant de décider si c'est suffisant pour lancer l'analyse.
 */
export const fetchMedia = async (url: string): Promise<MediaResult> => {
  const platform = detectPlatform(url);

  try {
    if (platform === 'tiktok') return await fetchTikTokMedia(url);
    if (platform === 'instagram') return await fetchInstagramMedia(url);
  } catch {
    return EMPTY_MEDIA;
  }

  return EMPTY_MEDIA;
};

/**
 * Ne lève jamais d'exception : l'appelant doit pouvoir proposer la saisie manuelle
 * de la légende plutôt que d'afficher une erreur brute.
 */
export const fetchCaption = async (url: string): Promise<CaptionResult> => {
  const platform = detectPlatform(url);

  try {
    if (platform === 'tiktok') return await fetchTikTokCaption(url);
    if (platform === 'instagram') return await fetchInstagramCaption(url);
    return { ok: false, reason: 'unsupported' };
  } catch {
    return { ok: false, reason: 'network' };
  }
};
