import {
  type AppleCredential,
  appleIdTokenPayload,
  appleProfileOf,
  isAppleCancel,
  withSavedProfile,
} from './apple';
import type { AppleProfileStore } from './apple-profile-store';
import type { AuthError } from './errors';

export type AppleIdToken = NonNullable<ReturnType<typeof appleIdTokenPayload>>;

/** Everything the flow talks to, injected so it can run without native modules in tests. */
export interface AppleSignInDeps {
  createNonce: () => string;
  sha256: (value: string) => Promise<string>;
  /** Opens Apple's sheet; rejects with `ERR_REQUEST_CANCELED` when the user closes it. */
  requestCredential: (hashedNonce: string) => Promise<AppleCredential>;
  profileStore: Pick<AppleProfileStore, 'load' | 'save' | 'clear'>;
  signInWithIdToken: (idToken: AppleIdToken) => Promise<{ error: AuthError | null }>;
}

export type AppleSignInOutcome =
  | { status: 'signed-in' }
  | { status: 'cancelled' }
  | { status: 'failed'; error: AuthError | null };

/**
 * Native Sign in with Apple, from Apple's sheet to the API session. Never throws.
 * Apple shares the name only on the first authorization: it is saved before calling the API
 * and cleared once the API confirms, so a failed attempt can be retried without losing it.
 */
export async function runAppleSignIn(deps: AppleSignInDeps): Promise<AppleSignInOutcome> {
  try {
    // Apple embeds the hashed nonce in the token; the API gets the raw one to check it.
    const nonce = deps.createNonce();
    const credential = await deps.requestCredential(await deps.sha256(nonce));

    const profile = appleProfileOf(credential);
    if (profile) await deps.profileStore.save(profile);
    const saved = profile ? null : await deps.profileStore.load();

    const idToken = appleIdTokenPayload(withSavedProfile(credential, saved), nonce);
    if (!idToken) return { status: 'failed', error: null };

    const result = await deps.signInWithIdToken(idToken);
    if (result.error) return { status: 'failed', error: result.error };

    await deps.profileStore.clear();
    return { status: 'signed-in' };
  } catch (error) {
    return isAppleCancel(error) ? { status: 'cancelled' } : { status: 'failed', error: null };
  }
}
