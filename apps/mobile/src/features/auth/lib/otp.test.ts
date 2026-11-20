import { OTP_LENGTH, sanitizeOtp } from './otp';

describe('sanitizeOtp', () => {
  it('keeps digits only', () => {
    expect(sanitizeOtp('12 3-4a5')).toBe('12345');
  });

  it('cuts a pasted text down to the code length', () => {
    expect(sanitizeOtp('Ton code : 1234567')).toHaveLength(OTP_LENGTH);
    expect(sanitizeOtp('Ton code : 1234567')).toBe('123456');
  });

  it('returns an empty string when there is no digit', () => {
    expect(sanitizeOtp('abc')).toBe('');
  });
});
