import * as z from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url(),
  // 'true' => passe par le proxy Vercel `/api/*` au lieu d'appeler VITE_API_URL en cross-site.
  VITE_USE_API_PROXY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error('Error parsing environment variables:');
  console.error(JSON.stringify(z.treeifyError(parsedEnv.error), null, 2));
  throw new Error('Invalid environment variables.');
}

export const env = parsedEnv.data;
