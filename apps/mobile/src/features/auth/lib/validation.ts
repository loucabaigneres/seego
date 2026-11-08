import * as z from 'zod';

import { nameSchema } from '@/domain/name';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const email = z.string().trim().toLowerCase().pipe(z.email('Cet email ne semble pas valide.'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Entre ton mot de passe.'),
});

export const signUpSchema = z.object({
  name: nameSchema,
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Au moins ${PASSWORD_MIN_LENGTH} caractères.`)
    .max(PASSWORD_MAX_LENGTH, `${PASSWORD_MAX_LENGTH} caractères maximum.`),
});

export type SignInValues = z.input<typeof signInSchema>;
export type SignUpValues = z.input<typeof signUpSchema>;

export { validate, type FieldErrors, type ValidationResult } from '@/lib/validate';
