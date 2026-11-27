import { generateKeyPairSync, verify } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
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
const SERVICES_ID = 'fr.seego.web';

const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString());

describe('createAppleClientSecret', () => {
  it('builds the claims Apple expects', () => {
    const now = Date.UTC(2026, 0, 1);
    const [header, payload] = createAppleClientSecret(key, SERVICES_ID, { now }).split('.');

    expect(decode(header!)).toEqual({ alg: 'ES256', kid: 'KEY456' });
    expect(decode(payload!)).toEqual({
      iss: 'TEAM123',
      sub: SERVICES_ID,
      aud: 'https://appleid.apple.com',
      iat: now / 1000,
      exp: now / 1000 + MAX_TTL_SECONDS,
    });
  });

  it('signs with the key, in JWS (r||s) format', () => {
    const [header, payload, signature] = createAppleClientSecret(key, SERVICES_ID).split('.');
    const valid = verify(
      'sha256',
      Buffer.from(`${header}.${payload}`),
      { key: publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(signature!, 'base64url'),
    );
    expect(valid).toBe(true);
  });

  it('accepts a key whose line breaks are escaped, as in an env var', () => {
    const escaped = { ...key, privateKey: key.privateKey.replace(/\n/g, '\\n') };
    expect(() => createAppleClientSecret(escaped, SERVICES_ID)).not.toThrow();
  });

  it('never exceeds the 6-month validity Apple allows', () => {
    const [, payload] = createAppleClientSecret(key, SERVICES_ID, {
      ttlSeconds: 400 * 24 * 3600,
    }).split('.');
    const { iat, exp } = decode(payload!);
    expect(exp - iat).toBe(MAX_TTL_SECONDS);
  });
});

describe('appleClientSecretProvider', () => {
  it('reuses the secret while valid, and signs a new one a day before it expires', () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 0, 1));
    const next = appleClientSecretProvider(key, SERVICES_ID);
    const first = next();
    expect(next()).toBe(first);

    vi.setSystemTime(Date.UTC(2026, 0, 1) + (MAX_TTL_SECONDS - 12 * 3600) * 1000);
    expect(next()).not.toBe(first);
    vi.useRealTimers();
  });
});
