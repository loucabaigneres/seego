import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { authClient } from '@/lib/auth-client';

import { appleIdTokenPayload, isAppleCancel } from '../lib/apple';
import { authErrorMessage } from '../lib/errors';
import { finishSignIn } from '../lib/navigation';

/**
 * Native Sign in with Apple (iOS only): Apple's sheet returns an identity token
 * that the API verifies, no browser round trip. Sign-in and sign-up are the same call.
 */
export function useAppleSignIn() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (isPending) return;
    setIsPending(true);
    setError(null);

    try {
      // Apple embeds the hashed nonce in the token; the API gets the raw one to check it.
      const nonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const idToken = appleIdTokenPayload(credential, nonce);
      if (!idToken) {
        setError(authErrorMessage(null));
        setIsPending(false);
        return;
      }

      const result = await authClient.signIn.social({ provider: 'apple', idToken });
      setIsPending(false);
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      await finishSignIn();
    } catch (err) {
      setIsPending(false);
      if (!isAppleCancel(err)) setError(authErrorMessage(null));
    }
  };

  return { isAvailable, signIn, isPending, error };
}
