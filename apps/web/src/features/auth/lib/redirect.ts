import { z } from 'zod';

/** Search params of the login/register pages: where to go once authenticated. */
export const authSearchSchema = z.object({
  redirect: z
    .string()
    .refine(
      (val) => val.startsWith('/') && !val.startsWith('//'),
      'Redirection interne obligatoire',
    )
    .optional()
    .catch(undefined),
  /** Set when a social sign-in (Apple) fails and the API sends the user back here. */
  error: z.string().optional().catch(undefined),
});

/** Message shown on the login page after a failed social sign-in. */
export function socialErrorMessage(error: string | undefined): string | null {
  if (!error) return null;
  return 'La connexion avec Apple a échoué. Réessaie, ou connecte-toi avec ton email.';
}
