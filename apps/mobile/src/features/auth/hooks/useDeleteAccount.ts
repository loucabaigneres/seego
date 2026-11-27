import * as AppleAuthentication from 'expo-apple-authentication';
import { useRef, useState } from 'react';
import { Platform } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { trpcClient } from '@/lib/trpc';

import {
  type AccountDeletionDeps,
  type AccountDeletionOutcome,
  DELETE_CONFIRMATION,
  runAccountDeletion,
} from '../lib/delete-account';
import { syncQueriesWithSession } from '../lib/query-cache';

const deps: AccountDeletionDeps = {
  hasAppleAccount: async () => {
    const { data } = await authClient.listAccounts();
    return (data ?? []).some((account) => account.providerId === 'apple');
  },
  requestAppleAuthorizationCode:
    Platform.OS === 'ios'
      ? async () => {
          if (!(await AppleAuthentication.isAvailableAsync())) return null;
          // Same scopes as the sign-in: an authorization without them would replace the user's
          // grant, and if the revocation failed, later sign-ins would get tokens without e-mail.
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          return credential.authorizationCode;
        }
      : null,
  deleteAccount: (appleAuthorizationCode) =>
    trpcClient.user.deleteAccount.mutate({
      confirmation: DELETE_CONFIRMATION,
      appleAuthorizationCode,
    }),
  signOutLocally: async () => {
    await authClient.signOut();
    await syncQueriesWithSession('signed-out');
  },
};

const MESSAGES: Partial<Record<AccountDeletionOutcome['status'], string>> = {
  'reauth-required':
    'Pour ta sécurité, reconnecte-toi avant de supprimer ton compte (ta connexion date de plus de 24 h).',
  failed: 'Impossible de supprimer ton compte pour le moment. Vérifie ta connexion et réessaie.',
};

/** Deletes the signed-in account for good; `onDeleted` runs once the session is gone. */
export function useDeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const [outcome, setOutcome] = useState<AccountDeletionOutcome | null>(null);
  // Guards against a double tap before the re-render disables the button.
  const inFlight = useRef(false);

  const deleteAccount = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsPending(true);
    setOutcome(null);

    let result: AccountDeletionOutcome;
    try {
      result = await runAccountDeletion(deps);
    } finally {
      inFlight.current = false;
      setIsPending(false);
    }

    setOutcome(result);
    if (result.status === 'deleted') onDeleted();
  };

  return {
    deleteAccount,
    isPending,
    needsReauth: outcome?.status === 'reauth-required',
    error: outcome ? (MESSAGES[outcome.status] ?? null) : null,
  };
}
