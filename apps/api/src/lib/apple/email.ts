/**
 * Domain of the stand-in e-mail given to an Apple account when Apple shares none. `.invalid` is
 * reserved (RFC 2606): such an address can never receive mail, and nothing is sent to it.
 */
export const APPLE_PLACEHOLDER_DOMAIN = 'apple.placeholder.invalid';

export function applePlaceholderEmail(sub: string): string {
  return `${sub}@${APPLE_PLACEHOLDER_DOMAIN}`;
}

export function isApplePlaceholderEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${APPLE_PLACEHOLDER_DOMAIN}`);
}

export interface AppleAccountUser {
  email: string;
  name: string;
}

/**
 * Fields to update on an account created with the placeholder, once Apple shares an e-mail
 * (the user reset Seego in their Apple ID settings): the real e-mail, and the name if it was
 * empty. `null` when there is nothing to fix. The name Apple sends is never forced over one the
 * user already has or chose.
 */
export function placeholderUpgrade(
  current: AppleAccountUser,
  incoming: { email?: unknown; emailVerified?: unknown; name?: unknown },
): { email: string; emailVerified: boolean; name?: string } | null {
  if (!isApplePlaceholderEmail(current.email)) return null;
  if (typeof incoming.email !== 'string' || !incoming.email) return null;
  if (isApplePlaceholderEmail(incoming.email)) return null;

  const name = typeof incoming.name === 'string' ? incoming.name.trim() : '';
  return {
    email: incoming.email,
    // Apple only hands out addresses it has verified (real or relay); the claim may be a string.
    emailVerified: incoming.emailVerified !== false && incoming.emailVerified !== 'false',
    ...(!current.name.trim() && name ? { name } : {}),
  };
}

export interface KnownAppleUser {
  email: string;
  emailVerified: boolean;
}

/**
 * E-mail for an Apple sign-in whose identity token carries none (the user's authorization was
 * granted without the e-mail scope). Better Auth refuses a sign-in without e-mail before looking
 * the account up, so: a user who already signed up with Apple keeps their account (found by the
 * stable Apple ID, `sub`); a new user gets a placeholder, as the Better Auth docs suggest, so the
 * sign-in still works. Returns the fields to merge into the Better Auth user (empty: keep Apple's).
 */
export async function resolveAppleEmail(
  profile: { email?: unknown; sub?: unknown },
  findKnownUser: (sub: string) => Promise<KnownAppleUser | null>,
): Promise<Partial<KnownAppleUser>> {
  if (typeof profile.email === 'string' && profile.email) return {};
  if (typeof profile.sub !== 'string' || !profile.sub) return {};

  const known = await findKnownUser(profile.sub);
  if (known) return known;
  return { email: applePlaceholderEmail(profile.sub), emailVerified: false };
}
