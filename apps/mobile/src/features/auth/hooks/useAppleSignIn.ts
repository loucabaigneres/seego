import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { authClient } from '@/lib/auth-client';

import { appleProfileStore } from '../lib/apple-profile-store';
import { type AppleSignInDeps, runAppleSignIn } from '../lib/apple-sign-in';
import { authErrorMessage } from '../lib/errors';
import { closeAuth, finishSignIn } from '../lib/navigation';

const nativeDeps: AppleSignInDeps = {
  createNonce: () => Crypto.randomUUID(),
  sha256: (value) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value),
  requestCredential: (nonce) =>
    AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce,
    }),
  profileStore: appleProfileStore,
  signInWithIdToken: (idToken) => authClient.signIn.social({ provider: 'apple', idToken }),
};

/**
 * Native Sign in with Apple (iOS only): Apple's sheet returns an identity token
 * that the API verifies, no browser round trip. Sign-in and sign-up are the same call.
 * The flow itself lives in `runAppleSignIn`; this hook only holds the screen state.
 */
export function useAppleSignIn() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guards against a double tap: state would only block the second tap after a re-render.
  const inFlight = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let active = true;
    AppleAuthentication.isAvailableAsync()
      .then((available) => active && setIsAvailable(available))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const signIn = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsPending(true);
    setError(null);

    let outcome;
    try {
      outcome = await runAppleSignIn(nativeDeps);
    } finally {
      inFlight.current = false;
      setIsPending(false);
    }

    if (outcome.status === 'failed') setError(authErrorMessage(outcome.error));
    if (outcome.status !== 'signed-in') return;

    // The session exists at this point: if refreshing the account data fails,
    // close the auth screen anyway rather than show a sign-in error.
    await finishSignIn().catch(closeAuth);
  };

  return { isAvailable, signIn, isPending, error };
}
