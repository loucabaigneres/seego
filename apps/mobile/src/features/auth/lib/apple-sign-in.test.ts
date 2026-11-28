import type { AppleCredential, AppleProfile } from './apple';
import { type AppleSignInDeps, runAppleSignIn } from './apple-sign-in';

const firstAuthorization: AppleCredential = {
  user: 'apple-user-1',
  identityToken: 'id-token',
  email: 'jane@privaterelay.appleid.com',
  fullName: { givenName: 'Jane', familyName: 'Doe' },
};

/** Later authorizations: Apple sends neither the name nor the e-mail again. */
const laterAuthorization: AppleCredential = {
  ...firstAuthorization,
  email: null,
  fullName: null,
};

function fakeDeps(overrides: Partial<AppleSignInDeps> = {}) {
  let stored: AppleProfile | null = null;
  const profileStore = {
    load: jest.fn(async () => stored),
    save: jest.fn(async (profile: AppleProfile) => {
      stored = profile;
    }),
    clear: jest.fn(async () => {
      stored = null;
    }),
  };
  const deps = {
    createNonce: () => 'raw-nonce',
    sha256: jest.fn(async (value: string) => `sha256(${value})`),
    requestCredential: jest.fn(async () => firstAuthorization),
    profileStore,
    signInWithIdToken: jest.fn(async () => ({ error: null })),
    ...overrides,
  };
  return { deps, stored: () => stored };
}

describe('runAppleSignIn', () => {
  it('sends the hashed nonce to Apple and the raw one to the API', async () => {
    const { deps } = fakeDeps();
    await runAppleSignIn(deps);

    expect(deps.requestCredential).toHaveBeenCalledWith('sha256(raw-nonce)');
    expect(deps.signInWithIdToken).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'id-token', nonce: 'raw-nonce' }),
    );
  });

  it('signs in and forgets the saved profile once the API confirms', async () => {
    const { deps, stored } = fakeDeps();

    await expect(runAppleSignIn(deps)).resolves.toEqual({ status: 'signed-in' });
    expect(deps.profileStore.save).toHaveBeenCalled();
    expect(stored()).toBeNull();
  });

  it('keeps the one-time name when the API fails, and sends it again on the retry', async () => {
    const apiError = { code: 'INVALID_TOKEN', status: 401 };
    const { deps, stored } = fakeDeps({
      signInWithIdToken: jest.fn().mockResolvedValueOnce({ error: apiError }),
    });

    await expect(runAppleSignIn(deps)).resolves.toEqual({ status: 'failed', error: apiError });
    expect(stored()).toMatchObject({ user: 'apple-user-1', givenName: 'Jane' });

    // Retry: Apple no longer sends the name, the saved one fills the gap.
    jest.mocked(deps.requestCredential).mockResolvedValueOnce(laterAuthorization);
    jest.mocked(deps.signInWithIdToken).mockResolvedValueOnce({ error: null });

    await expect(runAppleSignIn(deps)).resolves.toEqual({ status: 'signed-in' });
    expect(deps.signInWithIdToken).toHaveBeenLastCalledWith(
      expect.objectContaining({
        user: {
          name: { firstName: 'Jane', lastName: 'Doe' },
          email: 'jane@privaterelay.appleid.com',
        },
      }),
    );
    expect(stored()).toBeNull();
  });

  it('reports a closed Apple sheet as cancelled, without calling the API', async () => {
    const { deps } = fakeDeps({
      requestCredential: jest.fn().mockRejectedValue({ code: 'ERR_REQUEST_CANCELED' }),
    });

    await expect(runAppleSignIn(deps)).resolves.toEqual({ status: 'cancelled' });
    expect(deps.signInWithIdToken).not.toHaveBeenCalled();
  });

  it('fails without calling the API when Apple returns no identity token', async () => {
    const { deps } = fakeDeps({
      requestCredential: jest.fn(async () => ({ ...firstAuthorization, identityToken: null })),
    });

    await expect(runAppleSignIn(deps)).resolves.toEqual({ status: 'failed', error: null });
    expect(deps.signInWithIdToken).not.toHaveBeenCalled();
  });

  it('turns any other failure (Apple or network) into a failed outcome, never a throw', async () => {
    const { deps } = fakeDeps({
      signInWithIdToken: jest.fn().mockRejectedValue(new Error('Network request failed')),
    });

    await expect(runAppleSignIn(deps)).resolves.toEqual({ status: 'failed', error: null });
  });
});
