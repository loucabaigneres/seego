import { generateKeyPairSync } from 'node:crypto';
import { decodeProtectedHeader, importSPKI, jwtVerify } from 'jose';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  appleClientSecretProvider,
  createAppleClientSecret,
  MAX_TTL_SECONDS,
} from './clientSecret.js';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const key = {
  teamId: 'TEAM123',
  keyId: 'KEY456',
  privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
};
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const SERVICES_ID = 'fr.seego.web';

/** Checks the signature as Apple would, and returns the claims. */
async function verified(token: string) {
  const { payload } = await jwtVerify(token, await importSPKI(publicPem, 'ES256'), {
    issuer: 'TEAM123',
    audience: 'https://appleid.apple.com',
    subject: SERVICES_ID,
  });
  return payload;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('createAppleClientSecret', () => {
  it('signs the claims Apple expects with the key (ES256, kid)', async () => {
    const token = await createAppleClientSecret(key, SERVICES_ID);

    expect(decodeProtectedHeader(token)).toEqual({ alg: 'ES256', kid: 'KEY456' });
    const claims = await verified(token);
    expect(claims.exp! - claims.iat!).toBe(MAX_TTL_SECONDS);
  });

  it('accepts a key whose line breaks are escaped, as in an env var', async () => {
    const escaped = { ...key, privateKey: key.privateKey.replace(/\n/g, '\\n') };
    await expect(
      verified(await createAppleClientSecret(escaped, SERVICES_ID)),
    ).resolves.toBeDefined();
  });

  it('never exceeds the 6-month validity Apple allows', async () => {
    const token = await createAppleClientSecret(key, SERVICES_ID, { ttlSeconds: 400 * 24 * 3600 });
    const claims = await verified(token);
    expect(claims.exp! - claims.iat!).toBe(MAX_TTL_SECONDS);
  });
});

describe('appleClientSecretProvider', () => {
  it('serves the signed secret, and signs a new one a day before it expires', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.UTC(2026, 0, 1));
    const provider = appleClientSecretProvider(key, SERVICES_ID);

    const first = await provider.init();
    expect(provider.current()).toBe(first);

    // 12 h before expiry: the old secret is still served while the next one is signed.
    vi.setSystemTime(Date.UTC(2026, 0, 1) + (MAX_TTL_SECONDS - 12 * 3600) * 1000);
    expect(provider.current()).toBe(first);
    await vi.waitFor(() => expect(provider.current()).not.toBe(first));
  });

  it('rejects init when the key cannot be read', async () => {
    const provider = appleClientSecretProvider({ ...key, privateKey: 'not a key' }, SERVICES_ID);
    await expect(provider.init()).rejects.toThrow();
    expect(provider.current()).toBeUndefined();
  });
});
