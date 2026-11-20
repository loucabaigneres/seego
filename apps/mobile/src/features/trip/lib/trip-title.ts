import * as z from 'zod';

export const TRIP_TITLE_MAX_LENGTH = 80;

/** Same rule as `user.renameTrip`, so the API never has to refuse a title. */
const titleSchema = z
  .string()
  .trim()
  .min(1, 'Le titre ne peut pas être vide.')
  .max(TRIP_TITLE_MAX_LENGTH, `Le titre doit faire au plus ${TRIP_TITLE_MAX_LENGTH} caractères.`);

export type TitleChange =
  | { status: 'unchanged' }
  | { status: 'invalid'; error: string }
  | { status: 'ready'; title: string };

export function titleChange(draft: string, current: string | null | undefined): TitleChange {
  const result = titleSchema.safeParse(draft);
  if (!result.success) {
    return { status: 'invalid', error: result.error.issues[0]?.message ?? 'Titre invalide.' };
  }
  if (result.data === current?.trim()) return { status: 'unchanged' };
  return { status: 'ready', title: result.data };
}
