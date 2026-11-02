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
});
