export const OTP_LENGTH = 6;

/** Keeps the digits of a typed, pasted or autofilled code, up to the code length. */
export function sanitizeOtp(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
}
