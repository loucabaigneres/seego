import 'dotenv/config';
import * as z from 'zod';

// Define strict schema for environment variables
const envSchema = z.object({
  // Node configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number(),

  // Database configuration
  DATABASE_URL: z.url(),

  // Better Auth configuration
  BETTER_AUTH_SECRET: z.string().min(10, 'BETTER_AUTH_SECRET must be at least 10 characters long'),
  BETTER_AUTH_URL: z.url(),

  // Google OAuth configuration
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Sign in with Apple (native iOS): the identity token's audience is the app's bundle ID.
  // No default: a missing value must stop the API, not fail every Apple sign-in silently.
  APPLE_APP_BUNDLE_IDENTIFIER: z.string().min(1),

  // Frontend URL configuration
  FRONTEND_URL: z.url().default('http://localhost:5173'),

  AI_MODEL: z
    .string()
    .regex(
      /^(google|mistral):.+$/,
      'AI_MODEL must follow the "provider:model" format (e.g., "google:gemini-flash-lite-latest")',
    )
    .default('google:gemini-flash-lite-latest'),
  GEMINI_API_KEY: z.string().min(1).optional(),
  // MISTRAL_API_KEY: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with "re_"'),
  // Newsletter audience. Set only in production: when absent, waitlist leads are never pushed
  // to Resend contacts (staging and local addresses must stay out of the real audience) and
  // the admin campaign tools are disabled.
  RESEND_WAITLIST_SEGMENT_ID: z.uuid().optional(),
  // Signing secret of the Resend webhook pointing at POST /webhooks/resend (contact opt-outs).
  RESEND_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'RESEND_WEBHOOK_SECRET must start with "whsec_"')
    .optional(),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error parsing environment variables:');
  // Show detailed error messages for each invalid variable
  console.error(JSON.stringify(z.treeifyError(parsedEnv.error), null, 2));
  process.exit(1); // Exit with error code if validation fails
}

// Export the validated environment variables
export const env = parsedEnv.data;
