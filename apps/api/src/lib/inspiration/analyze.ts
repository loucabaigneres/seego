import { analyzeInspiration, type InlineImage, type InspirationAnalysis } from '../aiAnalysis.js';
import { downloadImageAsInline, extractHashtags, fetchMedia } from '../socialImport/index.js';
import { toTrpcAnalysisError } from './errors.js';

// On ne relaie qu'un nombre borné d'images d'aperçu vers l'IA.
const MAX_IMAGES = 4;

export interface UrlAnalysis {
  analysis: InspirationAnalysis;
  /** Légende collée à la main, à défaut celle récupérée sur la publication. */
  caption: string | null;
  tags: string[];
  /** Première image d'aperçu, réutilisée comme visuel des lieux importés. */
  previewImageUrl: string | null;
}

/**
 * Récupère la légende + les aperçus de la publication et les soumet à l'IA.
 * Lève une `TRPCError` explicite quand l'analyse n'est pas possible.
 */
export async function analyzeUrl(url: string, manualCaption?: string): Promise<UrlAnalysis> {
  const media = await fetchMedia(url);
  const caption = manualCaption?.trim() || media.caption;

  // Téléchargement best-effort des aperçus : on ignore silencieusement les échecs.
  const downloaded = await Promise.all(
    media.imageUrls.slice(0, MAX_IMAGES).map((imageUrl) => downloadImageAsInline(imageUrl)),
  );
  const images = downloaded.filter((image): image is InlineImage => image !== null);

  let analysis: InspirationAnalysis;
  try {
    analysis = await analyzeInspiration({ caption, images, transcript: media.transcript });
  } catch (error) {
    toTrpcAnalysisError(error);
  }

  // Si l'IA n'a pas renvoyé de tags, on retombe sur les hashtags de la légende.
  const tags = analysis.tags.length > 0 ? analysis.tags : caption ? extractHashtags(caption) : [];

  return { analysis, caption, tags, previewImageUrl: media.imageUrls[0] ?? null };
}
