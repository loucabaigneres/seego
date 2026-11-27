import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { revokeAppleAccess } from './revoke.js';

const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const key = {
  teamId: 'TEAM123',
  keyId: 'KEY456',
  privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
};
const clients = { bundleId: 'fr.seego.app', servicesId: 'fr.seego.web' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const ok = () => new Response(null, { status: 200 });

const formOf = (call: unknown[]) =>
  Object.fromEntries(new URLSearchParams(String((call[1] as RequestInit).body)));

describe('revokeAppleAccess', () => {
  it('from the iOS app: exchanges the code with the bundle ID, then revokes', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ refresh_token: 'refresh-1', access_token: 'access-1' }))
      .mockResolvedValueOnce(ok());

    const result = await revokeAppleAccess({
      authorizationCode: 'code-1',
      storedRefreshToken: 'stored-1',
      ...clients,
      key,
      fetchImpl,
    });

    expect(result).toEqual({ status: 'revoked', via: 'authorization-code' });
    const [tokenCall, revokeCall] = fetchImpl.mock.calls;
    expect(tokenCall![0]).toBe('https://appleid.apple.com/auth/token');
    expect(formOf(tokenCall!)).toMatchObject({
      client_id: 'fr.seego.app',
      grant_type: 'authorization_code',
      code: 'code-1',
    });
    expect(revokeCall![0]).toBe('https://appleid.apple.com/auth/revoke');
    expect(formOf(revokeCall!)).toMatchObject({
      client_id: 'fr.seego.app',
      token: 'refresh-1',
      token_type_hint: 'refresh_token',
    });
  });

  it('from the web: revokes the stored refresh token as the Services ID', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(ok());

    const result = await revokeAppleAccess({
      authorizationCode: undefined,
      storedRefreshToken: 'stored-1',
      ...clients,
      key,
      fetchImpl,
    });

    expect(result).toEqual({ status: 'revoked', via: 'stored-token' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0]![0]).toBe('https://appleid.apple.com/auth/revoke');
    expect(formOf(fetchImpl.mock.calls[0]!)).toMatchObject({
      client_id: 'fr.seego.web',
      token: 'stored-1',
      token_type_hint: 'refresh_token',
    });
  });

  it('skips when there is neither a code nor a stored token, calling nothing', async () => {
    const fetchImpl = vi.fn();
    await expect(
      revokeAppleAccess({
        authorizationCode: undefined,
        storedRefreshToken: null,
        ...clients,
        key,
        fetchImpl,
      }),
    ).resolves.toEqual({ status: 'skipped', reason: 'no-token' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports a refused code without trying to revoke', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(json({ error: 'invalid_grant' }, 400));
    await expect(
      revokeAppleAccess({
        authorizationCode: 'old',
        storedRefreshToken: null,
        ...clients,
        key,
        fetchImpl,
      }),
    ).resolves.toEqual({ status: 'failed', step: 'token', httpStatus: 400 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('never throws when Apple is unreachable', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    await expect(
      revokeAppleAccess({
        authorizationCode: undefined,
        storedRefreshToken: 'stored-1',
        ...clients,
        key,
        fetchImpl,
      }),
    ).resolves.toEqual({ status: 'failed', step: 'network' });
  });
});
