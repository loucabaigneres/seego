/**
 * Socle de l'analyse d'inspiration, indépendant du fournisseur d'IA. On s'appuie sur le
 * Vercel AI SDK (`generateObject`) : un unique schéma Zod décrit la sortie attendue et
 * sert à la fois de contrainte pour le modèle, de validation et de typage — plus besoin
 * de synchroniser un schéma « maison » avec un parseur. Le retry et l'auth (via headers)
 * sont pris en charge par le SDK. Un fournisseur concret (cf. `gemini.ts`) ne fournit que
 * son `LanguageModel` et appelle `runInspirationAnalysis`.
 */

import type { PlaceCategory } from '@voyagr/database';
import { generateObject, type LanguageModel } from 'ai';
import { z } from 'zod';

export interface InlineImage {
  mimeType: string;
  /** Contenu de l'image encodé en base64 (sans préfixe `data:`). */
  data: string;
}

export interface AnalysisInput {
  caption: string | null;
  images: InlineImage[];
  transcript?: string | null;
}

export type AnalysisErrorReason = 'missing_key' | 'blocked' | 'api_error' | 'bad_response';

export class AnalysisError extends Error {
  readonly reason: AnalysisErrorReason;

  constructor(reason: AnalysisErrorReason, message: string) {
    super(message);
    this.reason = reason;
    this.name = 'AnalysisError';
  }
}

const CATEGORIES = ['restaurant', 'hotel', 'activité', 'autre'] as const satisfies readonly [
  PlaceCategory,
  ...PlaceCategory[],
];
const categorySchema = z.enum(CATEGORIES);

const placeSchema = z.object({
  name: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  description: z.string().nullable(),
  category: categorySchema.nullable(),
});

const analysisSchema = z.object({
  /** Compte rendu rédigé du contenu de la publication. */
  summary: z.string(),
  /** Type global de la publication (hôtel / restaurant / activité), pour le filtre. */
  type: categorySchema.nullable(),
  /** Ville principale de la publication. */
  city: z.string().nullable(),
  /** Lieux détectés, avec adresse quand elle est connue. */
  places: z.array(placeSchema),
  /** Mots-clés thématiques (sans le `#`), utiles pour nourrir les voyages. */
  tags: z.array(z.string()),
});

export type InspirationAnalysis = z.infer<typeof analysisSchema>;

export const ANALYSIS_SYSTEM_PROMPT = `Tu es un assistant de voyage. On te donne le contenu d'une publication TikTok ou Instagram : sa légende, une ou plusieurs images d'aperçu, et parfois la transcription de sa bande-son (sous-titres). La transcription est souvent la source la plus riche : elle nomme des lieux précis absents de la légende.

Ta tâche :
1. Rédige un compte rendu clair et concis (3 à 6 phrases, en français) de ce que montre ou raconte la publication. Si des lieux précis sont nommés, cite-les dans le compte rendu.
2. Identifie TOUS les lieux mentionnés ou visibles (restaurants, monuments, villes, points d'intérêt, hébergements...). Si la publication présente une liste (ex. « top 3 », « 3 activités »), crée une entrée DISTINCTE par lieu. Pour chaque lieu :
   - "name" : le nom du lieu.
   - "address" : l'adresse postale complète SEULEMENT si tu la connais avec une confiance raisonnable. Sinon null. N'invente jamais une adresse.
   - "city" et "country" : renseigne-les quand tu peux les déduire, sinon null.
   - "description" : une phrase expliquant l'intérêt du lieu pour un voyageur, sinon null.
   - "category" : classe le lieu dans EXACTEMENT une de ces valeurs : "restaurant" (restaurant, bar, café, street-food), "hotel" (hôtel, hébergement), "activité" (monument, musée, parc, visite, point d'intérêt). Si rien ne correspond, "autre".
3. "type" : le type GLOBAL de la publication, dans EXACTEMENT une de ces valeurs : "restaurant", "hotel", "activité" (ou "autre" si rien ne correspond). C'est le thème dominant du post, pas forcément d'un lieu précis.
4. "city" : le nom de la ville principale de la publication (ex. "Paris"), sinon null.
5. "tags" : 3 à 8 mots-clés thématiques en minuscules, sans le caractère #.

Si aucun lieu n'est identifiable, renvoie une liste "places" vide.`;

/** Assemble la légende et la transcription (quand elles existent) en un seul bloc de texte. */
export const buildUserText = (caption: string | null, transcript: string | null): string => {
  const blocks: string[] = [];
  if (caption) blocks.push(`Légende de la publication :\n"""${caption}"""`);
  if (transcript) blocks.push(`Transcription de la bande-son (sous-titres) :\n"""${transcript}"""`);
  if (blocks.length === 0) {
    return "La publication n'a pas de texte exploitable : appuie-toi sur les images.";
  }
  return blocks.join('\n\n');
};

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

const trimToNull = (value: string | null): string | null => value?.trim() || null;

/** Nettoie la sortie du modèle : trim, lieux sans nom écartés, tags dédupliqués. */
const normalize = (raw: InspirationAnalysis): InspirationAnalysis => ({
  summary: raw.summary.trim(),
  type: raw.type,
  city: trimToNull(raw.city),
  places: raw.places
    .map((place) => ({
      name: place.name.trim(),
      address: trimToNull(place.address),
      city: trimToNull(place.city),
      country: trimToNull(place.country),
      description: trimToNull(place.description),
      category: place.category,
    }))
    .filter((place) => place.name.length > 0),
  tags: [
    ...new Set(raw.tags.map((tag) => tag.trim().replace(/^#/, '').toLowerCase()).filter(Boolean)),
  ],
});

/**
 * Analyse une publication (légende + transcription + images) avec le modèle fourni.
 * Le SDK gère le retry et la validation du schéma ; on se contente de normaliser la
 * sortie et de mapper les échecs sur `AnalysisError`. `label` contextualise les messages.
 */
export const runInspirationAnalysis = async (
  model: LanguageModel,
  { caption, images, transcript = null }: AnalysisInput,
  label: string,
): Promise<InspirationAnalysis> => {
  let result: InspirationAnalysis;
  try {
    const { object } = await generateObject({
      model,
      schema: analysisSchema,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: buildUserText(caption, transcript) },
            ...images.map((image) => ({
              type: 'image' as const,
              image: image.data,
              mediaType: image.mimeType,
            })),
          ],
        },
      ],
      temperature: 0.2,
      maxRetries: MAX_RETRIES,
      abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    result = normalize(object);
  } catch (error) {
    throw new AnalysisError('api_error', `${label} analysis failed: ${(error as Error).message}`);
  }

  if (!result.summary && result.places.length === 0) {
    throw new AnalysisError('bad_response', `${label} output is empty.`);
  }

  return result;
};
