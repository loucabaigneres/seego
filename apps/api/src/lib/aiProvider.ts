import { createGoogle } from '@ai-sdk/google';
import { createProviderRegistry, type LanguageModel } from 'ai';

import { env } from '../env.js';
import { AnalysisError } from './aiAnalysis.js';

/**
 * Registry centralizing all AI providers used in the project.
 * Identifiers format: `${provider}:${model}` (e.g. `google:gemini-flash-lite-latest`).
 */
const registry = createProviderRegistry({
  google: createGoogle({
    apiKey: env.GEMINI_API_KEY,
  }),
  // mistral: createMistral({
  //   apiKey: env.MISTRAL_API_KEY,
  // }),
});

type RegisteredModelId = Parameters<typeof registry.languageModel>[0];

/**
 * Resolves and validates the model configured in the environment before executing the call.
 */
export const getAnalysisModel = (): LanguageModel => {
  const [providerId] = env.AI_MODEL.split(':');

  if (providerId === 'google' && !env.GEMINI_API_KEY) {
    throw new AnalysisError('missing_key', 'GEMINI_API_KEY is not configured.');
  }

  // if (providerId === 'mistral' && !env.MISTRAL_API_KEY) {
  //   throw new AnalysisError('missing_key', 'MISTRAL_API_KEY is not configured.');
  // }

  return registry.languageModel(env.AI_MODEL as RegisteredModelId);
};
