import * as z from 'zod';

// Define strict schema for environment variables
const envSchema = z.object({
  // Optionnel : sans valeur, le front appelle sa propre origine (staging/prod : proxy Vercel -> API).
  VITE_API_URL: z.url().optional(),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error('❌ Error parsing environment variables:');
  // Show detailed error messages for each invalid variable
  console.error(JSON.stringify(z.treeifyError(parsedEnv.error), null, 2));
  throw new Error('Invalid environment variables.');
}

// Export the validated environment variables
export const env = parsedEnv.data;

/**
 * Base URL used to reach the API. Deployed, it is the front's own origin: Vercel proxies
 * `/api/auth`, `/trpc` and `/image-proxy` to the API (see vercel.json), which keeps the session
 * cookie first-party. Locally, set VITE_API_URL to the API (e.g. http://localhost:3000).
 */
export const apiUrl = env.VITE_API_URL ?? window.location.origin;
