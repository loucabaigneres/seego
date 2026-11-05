export type Platform = 'tiktok' | 'instagram' | 'other';

export type CaptionResult =
  | { ok: true; caption: string }
  | { ok: false; reason: 'unsupported' | 'not_found' | 'blocked' | 'network' };

/**
 * Média exploitable par l'analyse IA : la légende, les URLs des images d'aperçu et, pour
 * les vidéos TikTok, la transcription des sous-titres (le contenu parlé, qui nomme souvent
 * des lieux absents de la légende). On ne télécharge jamais la vidéo elle-même.
 */
export interface MediaResult {
  caption: string | null;
  imageUrls: string[];
  transcript: string | null;
}

export const EMPTY_MEDIA: MediaResult = { caption: null, imageUrls: [], transcript: null };
