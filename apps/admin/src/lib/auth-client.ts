import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { authBaseUrl } from '@/lib/api-url';

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  // Envoie le cookie de session sur les requêtes cross-origin (front et API sur des domaines différents)
  fetchOptions: { credentials: 'include' },
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession } = authClient;

/** Seul ce rôle (plugin admin de Better Auth) ouvre le back-office. */
export const ADMIN_ROLE = 'admin';

/** Session courante si l'utilisateur est un administrateur, sinon null. */
export async function getAdminSession() {
  const { data } = await authClient.getSession();
  return data?.user.role === ADMIN_ROLE ? data : null;
}
