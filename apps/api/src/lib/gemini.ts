/**
 * Fournisseur Gemini (Google AI Studio) pour l'analyse d'inspiration. Toute la logique
 * (schéma, prompt, retry, normalisation) vit dans `aiAnalysis.ts` ; ici on ne fait que
 * construire le modèle Google et déléguer. Ajouter un autre fournisseur (ex. Mistral)
 * revient à écrire l'équivalent de ce fichier.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '../env.js';
import {
  AnalysisError,
  runInspirationAnalysis,
  type AnalysisInput,
  type InspirationAnalysis,
} from './aiAnalysis.js';

const LABEL = 'Gemini';

/** Analyse une publication (légende + transcription + images d'aperçu) via Gemini. */
export const analyzeInspiration = async (input: AnalysisInput): Promise<InspirationAnalysis> => {
  if (!env.GEMINI_API_KEY) {
    throw new AnalysisError('missing_key', 'GEMINI_API_KEY is not configured.');
  }

  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
  return runInspirationAnalysis(google(env.GEMINI_MODEL), input, LABEL);
};
