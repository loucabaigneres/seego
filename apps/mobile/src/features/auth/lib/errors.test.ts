import { authErrorMessage } from './errors';

describe('authErrorMessage', () => {
  it('translates known Better Auth codes', () => {
    expect(authErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe(
      'Email ou mot de passe incorrect.',
    );
    expect(authErrorMessage({ code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' })).toMatch(
      /existe déjà/,
    );
  });

  it('translates e-mail verification code errors', () => {
    expect(authErrorMessage({ code: 'INVALID_OTP' })).toBe('Code invalide.');
    expect(authErrorMessage({ code: 'OTP_EXPIRED' })).toBe('Code expiré.');
    expect(authErrorMessage({ code: 'TOO_MANY_ATTEMPTS' })).toMatch(/nouveau code/);
  });

  it('translates social sign-in errors', () => {
    expect(authErrorMessage({ code: 'INVALID_TOKEN' })).toMatch(/échoué/);
  });

  it('points to the password only when the e-mail belongs to an unlinked account', () => {
    expect(authErrorMessage({ code: 'OAUTH_LINK_ERROR', message: 'account not linked' })).toMatch(
      /mot de passe/,
    );
    // Same code when the account cannot be created: no account exists, keep it generic.
    expect(authErrorMessage({ code: 'OAUTH_LINK_ERROR', message: 'unable to create user' })).toBe(
      'La connexion a échoué. Réessaie.',
    );
  });

  it('explains rate limiting whatever the code', () => {
    expect(authErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD', status: 429 })).toMatch(
      /Trop de tentatives/,
    );
  });

  it('never leaks the raw English message of an unknown error', () => {
    const message = authErrorMessage({ code: 'SOMETHING_NEW', message: 'Internal stuff' });
    expect(message).not.toMatch(/Internal/);
    expect(authErrorMessage(null)).toBe(message);
  });
});
