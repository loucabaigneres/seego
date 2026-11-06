import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as z from 'zod';

import { resolveApiUrl } from './lib/api-url';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url(),
  EXPO_PUBLIC_WEB_URL: z.url().default('http://localhost:5173'),
});

// Expo only inlines EXPO_PUBLIC_* variables that are referenced literally,
// so each one must be listed here rather than passing `process.env` as a whole.
const parsedEnv = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_WEB_URL: process.env.EXPO_PUBLIC_WEB_URL,
});

if (!parsedEnv.success) {
  throw new Error(
    `Variables d'environnement invalides (voir apps/mobile/.env.example) :\n${z.prettifyError(parsedEnv.error)}`,
  );
}

const env = parsedEnv.data;

/**
 * The API to call. On web the browser runs on the dev machine and keeps `localhost`
 * (which also keeps the session cookie same-site); on a device it becomes the machine's IP.
 * Release builds never rewrite it.
 */
export const API_URL = resolveApiUrl(
  env.EXPO_PUBLIC_API_URL,
  __DEV__ && Platform.OS !== 'web' ? Constants.expoConfig?.hostUri : null,
);

/** The web app: pages the mobile app hands over to, such as choosing a new password. */
export const WEB_URL = env.EXPO_PUBLIC_WEB_URL;
