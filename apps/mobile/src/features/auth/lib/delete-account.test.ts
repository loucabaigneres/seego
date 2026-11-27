import {
  type AccountDeletionDeps,
  isDeleteConfirmed,
  isReauthRequired,
  runAccountDeletion,
} from './delete-account';

function fakeDeps(overrides: Partial<AccountDeletionDeps> = {}) {
  return {
    hasAppleAccount: jest.fn(async () => false),
    requestAppleAuthorizationCode: jest.fn(async () => 'apple-code'),
    deleteAccount: jest.fn(async () => ({})),
    signOutLocally: jest.fn(async () => {}),
    ...overrides,
  };
}

describe('isDeleteConfirmed', () => {
  it('accepts the word, whatever the case or spaces', () => {
    expect(isDeleteConfirmed('SUPPRIMER')).toBe(true);
    expect(isDeleteConfirmed('  supprimer ')).toBe(true);
  });

  it('refuses anything else', () => {
    expect(isDeleteConfirmed('')).toBe(false);
    expect(isDeleteConfirmed('SUPPRIME')).toBe(false);
  });
});

describe('isReauthRequired', () => {
  it('recognizes the API refusing a stale session', () => {
    expect(isReauthRequired({ data: { code: 'PRECONDITION_FAILED' } })).toBe(true);
    expect(isReauthRequired({ data: { code: 'UNAUTHORIZED' } })).toBe(false);
    expect(isReauthRequired(new Error('Network request failed'))).toBe(false);
  });
});

describe('runAccountDeletion', () => {
  it('deletes an e-mail or Google account without asking Apple, then signs out', async () => {
    const deps = fakeDeps();

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'deleted' });
    expect(deps.requestAppleAuthorizationCode).not.toHaveBeenCalled();
    expect(deps.deleteAccount).toHaveBeenCalledWith(undefined);
    expect(deps.signOutLocally).toHaveBeenCalled();
  });

  it('sends a fresh Apple code for an Apple account, so the API can revoke it', async () => {
    const deps = fakeDeps({ hasAppleAccount: jest.fn(async () => true) });

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'deleted' });
    expect(deps.deleteAccount).toHaveBeenCalledWith('apple-code');
  });

  it('stops, deleting nothing, when the user closes the Apple sheet', async () => {
    const deps = fakeDeps({
      hasAppleAccount: jest.fn(async () => true),
      requestAppleAuthorizationCode: jest.fn().mockRejectedValue({ code: 'ERR_REQUEST_CANCELED' }),
    });

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'cancelled' });
    expect(deps.deleteAccount).not.toHaveBeenCalled();
  });

  it('still deletes when Apple fails for another reason (revocation skipped)', async () => {
    const deps = fakeDeps({
      hasAppleAccount: jest.fn(async () => true),
      requestAppleAuthorizationCode: jest.fn().mockRejectedValue(new Error('Apple down')),
    });

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'deleted' });
    expect(deps.deleteAccount).toHaveBeenCalledWith(undefined);
  });

  it('skips Apple where Sign in with Apple does not exist (Android, web)', async () => {
    const deps = fakeDeps({
      hasAppleAccount: jest.fn(async () => true),
      requestAppleAuthorizationCode: null,
    });

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'deleted' });
    expect(deps.hasAppleAccount).not.toHaveBeenCalled();
    expect(deps.deleteAccount).toHaveBeenCalledWith(undefined);
  });

  it('asks to sign in again when the session is too old, keeping the session', async () => {
    const deps = fakeDeps({
      deleteAccount: jest.fn().mockRejectedValue({ data: { code: 'PRECONDITION_FAILED' } }),
    });

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'reauth-required' });
    expect(deps.signOutLocally).not.toHaveBeenCalled();
  });

  it('reports any other API failure, keeping the session', async () => {
    const deps = fakeDeps({ deleteAccount: jest.fn().mockRejectedValue(new Error('500')) });

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'failed' });
    expect(deps.signOutLocally).not.toHaveBeenCalled();
  });

  it('reports the deletion even if the local sign-out fails', async () => {
    const deps = fakeDeps({ signOutLocally: jest.fn().mockRejectedValue(new Error('storage')) });

    await expect(runAccountDeletion(deps)).resolves.toEqual({ status: 'deleted' });
  });
});
