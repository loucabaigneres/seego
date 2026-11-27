import { type AppleKey, createAppleClientSecret } from './clientSecret.js';

const APPLE_AUTH = 'https://appleid.apple.com/auth';

export type AppleRevocationResult =
  | { status: 'revoked'; via: 'authorization-code' | 'stored-token' }
  | { status: 'skipped'; reason: 'no-token' }
  | { status: 'failed'; step: 'token' | 'revoke'; httpStatus: number }
  | { status: 'failed'; step: 'network' };

interface RevokeOptions {
  /** One-time authorization code from a fresh Sign in with Apple in the iOS app. */
  authorizationCode: string | undefined;
  /** Refresh token Better Auth kept from a web (redirect flow) sign-in, if any. */
  storedRefreshToken: string | null | undefined;
  /** iOS bundle ID: the client codes from the native app are issued to. */
  bundleId: string;
  /** Services ID: the client of the redirect flow, which the stored token belongs to. */
  servicesId: string;
  key: AppleKey;
  fetchImpl?: typeof fetch;
}

/**
 * Revokes the user's Sign in with Apple authorization, as Apple requires when an account is
 * deleted (App Store guideline 5.1.1(v)). Two ways, whichever the deletion has:
 * - from the iOS app: the native sign-in keeps no Apple token, so the app asks for a fresh
 *   authorization code, exchanged here (bundle ID) for a refresh token, which is revoked;
 * - otherwise (deletion from the web): the refresh token Better Auth stored when the user signed
 *   in through the redirect flow is revoked directly (Services ID).
 * Never throws: deleting the account must not depend on Apple being up.
 * See https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens
 */
export async function revokeAppleAccess({
  authorizationCode,
  storedRefreshToken,
  bundleId,
  servicesId,
  key,
  fetchImpl = fetch,
}: RevokeOptions): Promise<AppleRevocationResult> {
  try {
    if (authorizationCode) {
      const exchanged = await exchangeCode(authorizationCode, bundleId, key, fetchImpl);
      if ('status' in exchanged) return exchanged;
      return await revoke(exchanged, bundleId, key, fetchImpl, 'authorization-code');
    }
    if (storedRefreshToken) {
      const token = { value: storedRefreshToken, hint: 'refresh_token' } as const;
      return await revoke(token, servicesId, key, fetchImpl, 'stored-token');
    }
    return { status: 'skipped', reason: 'no-token' };
  } catch {
    return { status: 'failed', step: 'network' };
  }
}

interface AppleToken {
  value: string;
  hint: 'refresh_token' | 'access_token';
}

/** Body of a call to Apple's REST API, authenticated as `clientId`. */
async function form(
  clientId: string,
  key: AppleKey,
  fields: Record<string, string>,
): Promise<RequestInit> {
  // Short-lived: one secret per call is all it takes.
  const clientSecret = await createAppleClientSecret(key, clientId, { ttlSeconds: 5 * 60 });
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...fields }),
  };
}

async function exchangeCode(
  code: string,
  clientId: string,
  key: AppleKey,
  fetchImpl: typeof fetch,
): Promise<AppleToken | AppleRevocationResult> {
  const response = await fetchImpl(
    `${APPLE_AUTH}/token`,
    await form(clientId, key, { grant_type: 'authorization_code', code }),
  );
  if (!response.ok) return { status: 'failed', step: 'token', httpStatus: response.status };

  const tokens = (await response.json()) as { refresh_token?: string; access_token?: string };
  if (tokens.refresh_token) return { value: tokens.refresh_token, hint: 'refresh_token' };
  if (tokens.access_token) return { value: tokens.access_token, hint: 'access_token' };
  return { status: 'failed', step: 'token', httpStatus: response.status };
}

async function revoke(
  token: AppleToken,
  clientId: string,
  key: AppleKey,
  fetchImpl: typeof fetch,
  via: 'authorization-code' | 'stored-token',
): Promise<AppleRevocationResult> {
  const response = await fetchImpl(
    `${APPLE_AUTH}/revoke`,
    await form(clientId, key, { token: token.value, token_type_hint: token.hint }),
  );
  if (!response.ok) return { status: 'failed', step: 'revoke', httpStatus: response.status };
  return { status: 'revoked', via };
}
