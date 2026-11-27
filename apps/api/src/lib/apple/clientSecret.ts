import { createPrivateKey, sign } from 'node:crypto';

/** Apple refuses a client secret valid for more than 6 months (15,777,000 s). */
export const MAX_TTL_SECONDS = 180 * 24 * 60 * 60;

export interface AppleKey {
  /** Apple Developer Team ID. */
  teamId: string;
  /** ID of the Sign in with Apple key (.p8). */
  keyId: string;
  /** Content of the .p8 key (PEM). Escaped `\n`, as env vars often hold them, are accepted. */
  privateKey: string;
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

/**
 * Client secret for Apple: an ES256 JWT signed with the Sign in with Apple key, sent with every
 * call to Apple's token endpoint (code exchange, refresh, revocation). `clientId` is the client
 * the tokens belong to: the Services ID for the web redirect flow.
 * See https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret
 */
export function createAppleClientSecret(
  key: AppleKey,
  clientId: string,
  { ttlSeconds = MAX_TTL_SECONDS, now = Date.now() }: { ttlSeconds?: number; now?: number } = {},
): string {
  const iat = Math.floor(now / 1000);
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: key.keyId }));
  const payload = base64url(
    JSON.stringify({
      iss: key.teamId,
      iat,
      exp: iat + Math.min(ttlSeconds, MAX_TTL_SECONDS),
      aud: 'https://appleid.apple.com',
      sub: clientId,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const privateKey = createPrivateKey(key.privateKey.replace(/\\n/g, '\n'));
  // JWS wants the raw r||s signature, not Node's default DER encoding.
  const signature = sign('sha256', Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });
  return `${signingInput}.${base64url(signature)}`;
}

/**
 * Returns a client secret, signing a new one a day before the current one expires, so an API
 * that runs for months never sends an expired secret. Nothing is signed until the first call.
 */
export function appleClientSecretProvider(key: AppleKey, clientId: string) {
  const renewBeforeMs = 24 * 60 * 60 * 1000;
  let secret = '';
  let expiresAt = 0;

  return () => {
    const now = Date.now();
    if (now >= expiresAt - renewBeforeMs) {
      secret = createAppleClientSecret(key, clientId, { now });
      expiresAt = now + MAX_TTL_SECONDS * 1000;
    }
    return secret;
  };
}
