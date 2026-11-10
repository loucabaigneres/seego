import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from '@/config/env';

export const authClient = createAuthClient({
  // L'URL racine de ton API Fastify où est branché le handler Better Auth
  baseURL: env.VITE_API_URL,
  // Envoie le cookie de session sur les requêtes cross-origin (front et API sur des domaines différents)
  fetchOptions: { credentials: 'include' },
  plugins: [emailOTPClient()],
});

// On exporte les méthodes et hooks utiles directement pour simplifier les imports plus tard
export const { signIn, signUp, signOut, useSession } = authClient;
