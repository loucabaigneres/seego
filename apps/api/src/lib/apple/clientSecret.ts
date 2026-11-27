import { importPKCS8, SignJWT } from 'jose';

/** Apple refuses a client secret valid for more than 6 months (15,777,000 s). */
export const MAX_TTL_SECONDS = 180 * 24 * 60 * 60;

/** A new secret is signed this long before the current one expires. */
const RENEW_BEFORE_MS = 24 * 60 * 60 * 1000;

export interface AppleKey {
  /** Apple Developer Team ID. */
  teamId: string;
  /** ID of the Sign in with Apple key (.p8). */
  keyId: string;
  /** Content of the .p8 key (PEM). Escaped `\n`, as env vars often hold them, are accepted. */
  privateKey: string;
}

/**
 * Client secret for Apple: an ES256 JWT signed with the Sign in with Apple key, sent with every
 * call to Apple's token endpoint (code exchange, refresh, revocation). Apple has no static secret,
 * so it is always generated from the key, as in the Better Auth docs. `clientId` is the client the
 * tokens belong to: the Services ID for the web redirect flow.
 * See https://www.better-auth.com/docs/authentication/apple
 * and https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret
 */
export async function createAppleClientSecret(
  key: AppleKey,
  clientId: string,
  { ttlSeconds = MAX_TTL_SECONDS, now = Date.now() }: { ttlSeconds?: number; now?: number } = {},
): Promise<string> {
  const privateKey = await importPKCS8(key.privateKey.replace(/\\n/g, '\n'), 'ES256');
  const iat = Math.floor(now / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: key.keyId })
    .setIssuer(key.teamId)
    .setIssuedAt(iat)
    .setExpirationTime(iat + Math.min(ttlSeconds, MAX_TTL_SECONDS))
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .sign(privateKey);
}

/**
 * Keeps a valid client secret for Better Auth, so an API that runs for months never sends an
 * expired one: `init` signs the first secret, then `current` returns it and, a day before it
 * expires, signs the next one in the background.
 */
export function appleClientSecretProvider(key: AppleKey, clientId: string) {
  let secret: string | undefined;
  let expiresAt = 0;
  let renewing: Promise<string> | undefined;

  const renew = () => {
    renewing ??= createAppleClientSecret(key, clientId)
      .then((signed) => {
        secret = signed;
        expiresAt = Date.now() + MAX_TTL_SECONDS * 1000;
        return signed;
      })
      .finally(() => {
        renewing = undefined;
      });
    return renewing;
  };

  return {
    /** Signs the first secret; awaited once, when Better Auth loads the Apple provider. */
    init: renew,
    /** The current secret; the previous one is still valid while the next one is being signed. */
    current: () => {
      if (Date.now() >= expiresAt - RENEW_BEFORE_MS) {
        renew().catch((err) => console.error('[apple] could not renew the client secret:', err));
      }
      return secret;
    },
  };
}
