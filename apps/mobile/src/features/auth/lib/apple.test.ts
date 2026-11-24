import {
  appleIdTokenPayload,
  appleProfileOf,
  isAppleCancel,
  isAppleProfile,
  withSavedProfile,
} from './apple';

const credential = {
  user: 'apple-user-1',
  identityToken: 'id-token',
  email: null,
  fullName: null,
};

const firstAuthorization = {
  ...credential,
  email: 'jane@privaterelay.appleid.com',
  fullName: { givenName: 'Jane', familyName: 'Doe' },
};

describe('appleIdTokenPayload', () => {
  it('returns null without an identity token', () => {
    expect(appleIdTokenPayload({ ...credential, identityToken: null }, 'nonce')).toBeNull();
  });

  it('sends the token with the raw nonce', () => {
    expect(appleIdTokenPayload(credential, 'raw-nonce')).toEqual({
      token: 'id-token',
      nonce: 'raw-nonce',
    });
  });

  it('forwards the name and e-mail Apple shares on the first authorization', () => {
    const payload = appleIdTokenPayload(
      { ...firstAuthorization, fullName: { givenName: 'Jane', familyName: null } },
      'nonce',
    );
    expect(payload?.user).toEqual({
      name: { firstName: 'Jane', lastName: undefined },
      email: 'jane@privaterelay.appleid.com',
    });
  });

  it('leaves the name out when Apple sends an empty one', () => {
    const payload = appleIdTokenPayload(
      { ...credential, fullName: { givenName: null, familyName: null } },
      'nonce',
    );
    expect(payload).not.toHaveProperty('user');
  });
});

describe('appleProfileOf', () => {
  it('keeps the one-time name and e-mail with the Apple user ID', () => {
    expect(appleProfileOf(firstAuthorization)).toEqual({
      user: 'apple-user-1',
      givenName: 'Jane',
      familyName: 'Doe',
      email: 'jane@privaterelay.appleid.com',
    });
  });

  it('returns null on later authorizations, which carry neither', () => {
    expect(appleProfileOf(credential)).toBeNull();
  });
});

describe('withSavedProfile', () => {
  const saved = appleProfileOf(firstAuthorization);

  it('restores the name and e-mail on a retry of the same Apple user', () => {
    expect(withSavedProfile(credential, saved)).toMatchObject({
      email: 'jane@privaterelay.appleid.com',
      fullName: { givenName: 'Jane', familyName: 'Doe' },
    });
  });

  it('ignores a profile saved for another Apple user', () => {
    expect(withSavedProfile({ ...credential, user: 'apple-user-2' }, saved)).toEqual({
      ...credential,
      user: 'apple-user-2',
    });
  });

  it('keeps what Apple sent this time over the saved profile', () => {
    const fresh = { ...credential, fullName: { givenName: 'Janet', familyName: null } };
    expect(withSavedProfile(fresh, saved).fullName).toEqual({
      givenName: 'Janet',
      familyName: null,
    });
  });

  it('changes nothing without a saved profile', () => {
    expect(withSavedProfile(credential, null)).toBe(credential);
  });
});

describe('isAppleProfile', () => {
  it('accepts a complete profile, nulls included', () => {
    expect(
      isAppleProfile({ user: 'apple-user-1', givenName: null, familyName: null, email: null }),
    ).toBe(true);
  });

  it('rejects anything malformed', () => {
    expect(isAppleProfile(null)).toBe(false);
    expect(isAppleProfile('Jane')).toBe(false);
    expect(isAppleProfile({ givenName: 'Jane', familyName: null, email: null })).toBe(false);
    expect(isAppleProfile({ user: '', givenName: null, familyName: null, email: null })).toBe(
      false,
    );
    expect(isAppleProfile({ user: 'u', givenName: 42, familyName: null, email: null })).toBe(false);
  });
});

describe('isAppleCancel', () => {
  it('recognizes the cancel code only', () => {
    expect(isAppleCancel({ code: 'ERR_REQUEST_CANCELED' })).toBe(true);
    expect(isAppleCancel({ code: 'ERR_REQUEST_FAILED' })).toBe(false);
    expect(isAppleCancel(null)).toBe(false);
  });
});
