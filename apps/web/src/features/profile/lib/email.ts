/**
 * Domain of the stand-in address the API gives an Apple account when Apple shares no e-mail
 * (`APPLE_PLACEHOLDER_DOMAIN` in apps/api/src/lib/apple/email.ts). It means nothing to the user.
 */
const APPLE_PLACEHOLDER_DOMAIN = '@apple.placeholder.invalid';

/** The e-mail to show on the profile, or `null` for an Apple account without a real one. */
export function displayEmail(email?: string | null): string | null {
  if (!email || email.toLowerCase().endsWith(APPLE_PLACEHOLDER_DOMAIN)) return null;
  return email;
}
