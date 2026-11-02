import * as z from 'zod';

export const NAME_MIN_LENGTH = 2;

/** Display name rule, shared by sign-up and the profile editor. */
export const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, `Ton prénom doit faire au moins ${NAME_MIN_LENGTH} caractères.`);
