/** The part of an Apple credential the API needs (subset of `AppleAuthenticationCredential`). */
export interface AppleCredential {
  identityToken: string | null;
  email: string | null;
  fullName: { givenName: string | null; familyName: string | null } | null;
}

/** Thrown by `signInAsync` when the user closes the Apple sheet: not an error to show. */
export const APPLE_CANCELED_CODE = 'ERR_REQUEST_CANCELED';

export function isAppleCancel(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === APPLE_CANCELED_CODE
  );
}

/**
 * Body of Better Auth's `idToken` sign-in for Apple, or `null` without a token.
 * `nonce` is the raw value: Apple received its SHA-256 and the API hashes it again to compare.
 * Apple gives the name and e-mail on the very first authorization only, so they ride along
 * when present: the API keeps them on account creation.
 */
export function appleIdTokenPayload(credential: AppleCredential, nonce: string) {
  if (!credential.identityToken) return null;

  const firstName = credential.fullName?.givenName ?? undefined;
  const lastName = credential.fullName?.familyName ?? undefined;
  const email = credential.email ?? undefined;
  const hasName = Boolean(firstName || lastName);

  return {
    token: credential.identityToken,
    nonce,
    ...(hasName || email
      ? { user: { ...(hasName ? { name: { firstName, lastName } } : {}), email } }
      : {}),
  };
}
