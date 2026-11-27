import { describe, expect, it, vi } from 'vitest';
import { isApplePlaceholderEmail, placeholderUpgrade, resolveAppleEmail } from './email.js';

const placeholderAccount = { email: '001234.abcd@apple.placeholder.invalid', name: '' };

describe('placeholderUpgrade', () => {
  it('replaces the placeholder with the e-mail Apple now shares, and fills an empty name', () => {
    expect(
      placeholderUpgrade(placeholderAccount, {
        email: 'jane@privaterelay.appleid.com',
        emailVerified: 'true',
        name: 'Jane Doe',
      }),
    ).toEqual({ email: 'jane@privaterelay.appleid.com', emailVerified: true, name: 'Jane Doe' });
  });

  it('never overrides a name the user already has', () => {
    const patch = placeholderUpgrade(
      { ...placeholderAccount, name: 'Janou' },
      { email: 'jane@icloud.com', name: 'Jane Doe' },
    );
    expect(patch).toEqual({ email: 'jane@icloud.com', emailVerified: true });
  });

  it('leaves accounts with a real e-mail alone', () => {
    expect(
      placeholderUpgrade({ email: 'jane@icloud.com', name: '' }, { email: 'other@icloud.com' }),
    ).toBeNull();
  });

  it('does nothing while Apple still sends no e-mail', () => {
    expect(placeholderUpgrade(placeholderAccount, {})).toBeNull();
    expect(placeholderUpgrade(placeholderAccount, { email: '' })).toBeNull();
  });
});

const known = { email: 'jane@privaterelay.appleid.com', emailVerified: true };

describe('resolveAppleEmail', () => {
  it("keeps Apple's e-mail when the token has one", async () => {
    const find = vi.fn();
    await expect(
      resolveAppleEmail({ email: 'jane@icloud.com', sub: 'apple-1' }, find),
    ).resolves.toEqual({});
    expect(find).not.toHaveBeenCalled();
  });

  it('signs a known Apple user in with the e-mail of their account', async () => {
    const find = vi.fn().mockResolvedValue(known);
    await expect(resolveAppleEmail({ sub: 'apple-1' }, find)).resolves.toEqual(known);
    expect(find).toHaveBeenCalledWith('apple-1');
  });

  it('gives a new user without e-mail an unverified placeholder', async () => {
    const find = vi.fn().mockResolvedValue(null);
    const result = await resolveAppleEmail({ sub: '001234.abcd.1234' }, find);
    expect(result).toEqual({
      email: '001234.abcd.1234@apple.placeholder.invalid',
      emailVerified: false,
    });
    expect(isApplePlaceholderEmail(result.email!)).toBe(true);
  });

  it('leaves a token without subject to Better Auth', async () => {
    await expect(resolveAppleEmail({}, vi.fn())).resolves.toEqual({});
  });
});

describe('isApplePlaceholderEmail', () => {
  it('only matches the placeholder domain', () => {
    expect(isApplePlaceholderEmail('x@APPLE.placeholder.invalid')).toBe(true);
    expect(isApplePlaceholderEmail('jane@privaterelay.appleid.com')).toBe(false);
  });
});
