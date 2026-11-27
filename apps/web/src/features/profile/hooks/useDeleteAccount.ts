import { resetAnalytics, track } from '@/lib/analytics';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

/** Word to type to confirm; the API refuses anything else. */
export const DELETE_CONFIRMATION = 'SUPPRIMER';

export function isDeleteConfirmed(typed: string): boolean {
  return typed.trim().toUpperCase() === DELETE_CONFIRMATION;
}

/**
 * Deletes the signed-in account for good, then drops the local session and cached data.
 * The API refuses a session older than 24 h (`PRECONDITION_FAILED`): the user signs in again.
 * Apple accounts: the API revokes the Apple token it stored at a web sign-in. An account that only
 * ever signed in from the iOS app has no stored token; deleting it from here skips the revocation.
 */
export function useDeleteAccount() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.user.deleteAccount.mutationOptions({
      onSuccess: async () => {
        track('account_deleted');
        // The server session is already gone with the account: this only clears the cookie.
        await authClient.signOut().catch(() => {});
        queryClient.clear();
        resetAnalytics();
        navigate({ to: '/' });
      },
    }),
  );

  const needsReauth = mutation.error?.data?.code === 'PRECONDITION_FAILED';

  const reauthenticate = async () => {
    await authClient.signOut().catch(() => {});
    queryClient.clear();
    navigate({ to: '/login', search: { redirect: '/profile' } });
  };

  return {
    deleteAccount: () => mutation.mutate({ confirmation: DELETE_CONFIRMATION }),
    isDeleting: mutation.isPending,
    needsReauth,
    error: mutation.isError
      ? needsReauth
        ? 'Pour ta sécurité, reconnecte-toi avant de supprimer ton compte (ta connexion date de plus de 24 h).'
        : 'Impossible de supprimer ton compte pour le moment. Vérifie ta connexion et réessaie.'
      : null,
    reauthenticate,
  };
}
