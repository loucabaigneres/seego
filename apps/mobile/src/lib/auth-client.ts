import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { API_URL } from '@/env';

/**
 * Better Auth client. On native, the session cookie lives in SecureStore
 * (Keychain / Keystore) and the plugin replays it on every auth request;
 * on web, the browser handles cookies as usual.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      // Must match `scheme` in app.json and `trustedOrigins` in the API.
      scheme: 'seego',
      storagePrefix: 'seego',
      storage: SecureStore,
    }),
    // E-mail accounts confirm their address with a 6-digit code before signing in.
    emailOTPClient(),
  ],
});

/**
 * Headers that authenticate a non-auth request (tRPC) with the stored session.
 * Empty on web, where the browser sends the cookie itself.
 */
export function getAuthHeaders(): Record<string, string> {
  if (Platform.OS === 'web') return {};
  const cookie = authClient.getCookie();
  return cookie ? { Cookie: cookie } : {};
}
