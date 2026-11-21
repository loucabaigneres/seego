import { appleIdTokenPayload, isAppleCancel } from './apple';

const credential = {
  identityToken: 'id-token',
  email: null,
  fullName: null,
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
      {
        ...credential,
        email: 'jane@privaterelay.appleid.com',
        fullName: { givenName: 'Jane', familyName: null },
      },
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

describe('isAppleCancel', () => {
  it('recognizes the cancel code only', () => {
    expect(isAppleCancel({ code: 'ERR_REQUEST_CANCELED' })).toBe(true);
    expect(isAppleCancel({ code: 'ERR_REQUEST_FAILED' })).toBe(false);
    expect(isAppleCancel(null)).toBe(false);
  });
});
