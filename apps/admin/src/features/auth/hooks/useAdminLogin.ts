import { useMutation } from '@tanstack/react-query';
import { getAdminSession, signIn, signOut } from '@/lib/auth-client';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou mot de passe incorrect.',
  EMAIL_NOT_VERIFIED: "Ton adresse e-mail n'est pas encore vérifiée.",
  BANNED_USER: 'Ce compte est suspendu.',
};

export class AdminLoginError extends Error {}

/**
 * Signs in with e-mail + password, then checks the Better Auth 'admin' role.
 * A non-admin account is signed out straight away: the session would be useless here
 * (every admin procedure answers FORBIDDEN) and should not linger in the browser.
 */
export function useAdminLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await signIn.email({ email, password });
      if (error) {
        throw new AdminLoginError(
          (error.code && ERROR_MESSAGES[error.code]) ??
            'Connexion impossible, réessaie dans un instant.',
        );
      }

      const session = await getAdminSession();
      if (!session) {
        await signOut();
        throw new AdminLoginError('Accès réservé aux administrateurs.');
      }
      return session;
    },
  });
}
