import type { PlaceCategory } from '@voyagr/database';
import { generateText, NoObjectGeneratedError, Output, type LanguageModel } from 'ai';
import * as z from 'zod';
import { getAnalysisModel } from './aiProvider.js';

export interface InlineImage {
  mimeType: string;
  /** Content of the image in base64 format */
  data: string;
}

export interface AnalysisInput {
  caption: string | null;
  images: InlineImage[];
  transcript?: string | null;
}

export type AnalysisErrorReason =
  | 'missing_key'
  | 'empty_input'
  | 'blocked'
  | 'api_error'
  | 'bad_response';

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

const CATEGORY_DESCRIPTION =
  '"restaurant" (restaurant, bar, café, street-food), "hotel" (hôtel, hébergement), "activité" (monument, musée, parc, visite, point d\'intérêt), ou "autre".';

const categorySchema = z.enum(CATEGORIES);

const placeSchema = z.object({
  name: z.string().describe('Nom précis du lieu.'),
  address: z
    .string()
    .nullable()
    .describe(
      'Adresse postale complète SEULEMENT si connue avec certitude, sinon null. Ne jamais inventer.',
    ),
  city: z.string().nullable().describe('Ville du lieu si déductible, sinon null.'),
  country: z.string().nullable().describe('Pays du lieu si déductible, sinon null.'),
  description: z
    .string()
    .nullable()
    .describe("Une phrase expliquant l'intérêt du lieu pour un voyageur, sinon null."),
  category: categorySchema.nullable().describe(`Catégorie du lieu : ${CATEGORY_DESCRIPTION}`),
});

export const analysisSchema = z.object({
  summary: z
    .string()
    .describe(
      'Compte rendu clair et concis (3 à 6 phrases, en français) de ce que montre ou raconte la publication, en citant les lieux précis.',
    ),
  type: categorySchema
    .nullable()
    .describe('Thème global dominant de la publication (restaurant, hotel, activité ou autre).'),
  city: z
    .string()
    .nullable()
    .describe('Ville principale de la publication (ex. "Paris"), sinon null.'),
  places: z
    .array(placeSchema)
    .describe(
      'Tous les lieux mentionnés ou visibles (une entrée distincte par lieu). Liste vide si aucun.',
    ),
  tags: z
    .array(z.string())
    .describe('3 à 8 mots-clés thématiques en minuscules, sans le caractère #.'),
});

export type InspirationAnalysis = z.infer<typeof analysisSchema>;

export const ANALYSIS_SYSTEM_PROMPT = `Tu es un assistant de voyage chargé d'extraire les lieux d'intérêt d'une publication TikTok ou Instagram.
Croise toutes les sources fournies (légende, transcription audio et images) : la transcription nomme souvent des lieux précis absents de la légende.
Si la publication présente une liste (ex. « top 3 », « mes bonnes adresses »), crée une entrée distincte pour chaque lieu.
Reste factuel : n'invente jamais d'adresse postale si tu n'en es pas certain.`;

export const buildUserText = (caption: string | null, transcript: string | null): string => {
  const blocks: string[] = [];
  if (caption?.trim()) blocks.push(`Légende de la publication :\n"""${caption.trim()}"""`);
  if (transcript?.trim()) {
    blocks.push(`Transcription de la bande-son (sous-titres) :\n"""${transcript.trim()}"""`);
  }
  return blocks.length > 0
    ? blocks.join('\n\n')
    : "La publication n'a pas de texte exploitable : appuie-toi uniquement sur les images jointes.";
};

const REQUEST_TIMEOUT_MS = 30_000; // 30 seconds timeout for the AI analysis request.
const MAX_RETRIES = 3; // Maximum number of attempts in case of error.

const trimToNull = (value: string | null): string | null => value?.trim() || null;

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
 * Analyzes a publication (caption + transcript + images) with the configured model
 * and returns structured information about the content.
 */
export const analyzeInspiration = async (
  { caption, images, transcript = null }: AnalysisInput,
  model?: LanguageModel,
): Promise<InspirationAnalysis> => {
  const hasText = Boolean(caption?.trim() || transcript?.trim());
  if (!hasText && images.length === 0) {
    throw new AnalysisError(
      'empty_input',
      'Cannot analyze inspiration: caption, transcript, and images are all empty.',
    );
  }

  const resolvedModel = model ?? getAnalysisModel();
  const modelLabel =
    typeof resolvedModel === 'string'
      ? resolvedModel
      : `${resolvedModel.provider}/${resolvedModel.modelId}`;

  try {
    const { output, finishReason } = await generateText({
      model: resolvedModel,
      output: Output.object({ schema: analysisSchema }),
      instructions: ANALYSIS_SYSTEM_PROMPT,
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

    if (finishReason === 'content-filter') {
      throw new AnalysisError(
        'blocked',
        `${modelLabel} blocked the content due to safety filters.`,
      );
    }

    const result = normalize(output);

    if (!result.summary) {
      throw new AnalysisError('bad_response', `${modelLabel} returned an empty summary.`);
    }

    return result;
  } catch (error) {
    if (error instanceof AnalysisError) {
      throw error;
    }
    if (NoObjectGeneratedError.isInstance(error)) {
      if (error.finishReason === 'content-filter') {
        throw new AnalysisError('blocked', `${modelLabel} blocked the response.`);
      }
      throw new AnalysisError(
        'bad_response',
        `${modelLabel} failed to generate valid structured output: ${error.message}`,
      );
    }
    throw new AnalysisError(
      'api_error',
      `${modelLabel} analysis failed: ${(error as Error).message}`,
    );
  }
};
