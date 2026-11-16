import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { authBaseUrl } from '@/lib/api-url';

export const authClient = createAuthClient({
  // L'URL racine de ton API Fastify où est branché le handler Better Auth
  baseURL: authBaseUrl,
  // Envoie le cookie de session sur les requêtes cross-origin (front et API sur des domaines différents)
  fetchOptions: { credentials: 'include' },
  plugins: [emailOTPClient()],
});

// On exporte les méthodes et hooks utiles directement pour simplifier les imports plus tard
export const { signIn, signUp, signOut, useSession } = authClient;
