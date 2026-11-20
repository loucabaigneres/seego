import { TRPCError } from '@trpc/server';
import { AnalysisError } from '../aiAnalysis.js';
import { detectPlatform, type Platform } from '../socialImport/index.js';

// Code d'erreur reconnu par le front pour déplier le champ de saisie manuelle.
export const CAPTION_UNAVAILABLE = 'CAPTION_UNAVAILABLE';
// Code d'erreur renvoyé quand l'analyse IA n'est pas configurée côté serveur.
export const AI_UNAVAILABLE = 'AI_UNAVAILABLE';

/** Plateforme du lien, ou erreur 400 si ce n'est ni TikTok ni Instagram. */
export function requireSupportedPlatform(url: string): Exclude<Platform, 'other'> {
  const platform = detectPlatform(url);

  if (platform === 'other') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Seuls les liens TikTok et Instagram sont pris en charge pour le moment.',
    });
  }

  return platform;
}

/** Traduit une erreur d'analyse IA en erreur tRPC ; relance telle quelle toute autre erreur. */
export function toTrpcAnalysisError(error: unknown): never {
  if (!(error instanceof AnalysisError)) throw error;

  switch (error.reason) {
    case 'missing_key':
      throw new TRPCError({ code: 'PRECONDITION_FAILED', message: AI_UNAVAILABLE });
    case 'empty_input':
      throw new TRPCError({ code: 'BAD_REQUEST', message: CAPTION_UNAVAILABLE });
    case 'blocked':
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Cette publication a été refusée par l'analyse (contenu bloqué).",
      });
    default:
      throw new TRPCError({
        code: 'BAD_GATEWAY',
        message: "L'analyse IA a échoué, réessaie dans un instant.",
      });
  }
}
