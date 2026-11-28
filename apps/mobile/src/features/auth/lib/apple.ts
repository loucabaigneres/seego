/** The part of an Apple credential the API needs (subset of `AppleAuthenticationCredential`). */
export interface AppleCredential {
  /** Stable Apple user ID, the same on every authorization. */
  user: string;
  identityToken: string | null;
  email: string | null;
  fullName: { givenName: string | null; familyName: string | null } | null;
}

/** Name and e-mail Apple shares on the very first authorization only, kept until the API has them. */
export interface AppleProfile {
  user: string;
  givenName: string | null;
  familyName: string | null;
  email: string | null;
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

const isStringOrNull = (value: unknown) => value === null || typeof value === 'string';

/** Checks a profile read back from storage: anything malformed is treated as no profile. */
export function isAppleProfile(value: unknown): value is AppleProfile {
  if (typeof value !== 'object' || value === null) return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.user === 'string' &&
    profile.user.length > 0 &&
    isStringOrNull(profile.givenName) &&
    isStringOrNull(profile.familyName) &&
    isStringOrNull(profile.email)
  );
}

/** The one-time profile of this authorization, or `null` when Apple sent neither name nor e-mail. */
export function appleProfileOf(credential: AppleCredential): AppleProfile | null {
  const givenName = credential.fullName?.givenName ?? null;
  const familyName = credential.fullName?.familyName ?? null;
  const email = credential.email ?? null;
  if (!givenName && !familyName && !email) return null;
  return { user: credential.user, givenName, familyName, email };
}

/**
 * Fills a retry's credential with the profile saved from the first authorization.
 * Apple sends the name only once: if the API call that should have kept it failed,
 * the next authorization comes back without it and the account would be created nameless.
 * A profile saved for another Apple user is ignored.
 */
export function withSavedProfile(
  credential: AppleCredential,
  saved: AppleProfile | null,
): AppleCredential {
  if (!saved || saved.user !== credential.user) return credential;
  const hasName = Boolean(credential.fullName?.givenName || credential.fullName?.familyName);
  return {
    ...credential,
    email: credential.email ?? saved.email,
    fullName: hasName
      ? credential.fullName
      : { givenName: saved.givenName, familyName: saved.familyName },
  };
}

/**
 * Body of Better Auth's `idToken` sign-in for Apple, or `null` without a token.
 * `nonce` is the raw value: Apple received its SHA-256 and the API hashes it again to compare.
 * The name and e-mail ride along when known: the API keeps them on account creation.
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
