import { nameSchema } from '@/domain/name';

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

/** Letter shown in the avatar: the name's first character, else the email's, else "?". */
export function avatarInitial(name?: string | null, email?: string | null): string {
  const source = name?.trim() || displayEmail(email)?.trim() || '';
  // `Array.from` splits by code point, so an accented or astral first letter stays whole.
  const [first] = Array.from(source);
  return first ? first.toLocaleUpperCase('fr-FR') : '?';
}

export type NameChange =
  | { status: 'unchanged' }
  | { status: 'invalid'; error: string }
  | { status: 'ready'; name: string };

export function nameChange(draft: string, current: string | null | undefined): NameChange {
  const result = nameSchema.safeParse(draft);
  if (!result.success) {
    return { status: 'invalid', error: result.error.issues[0]?.message ?? 'Nom invalide.' };
  }
  if (result.data === current?.trim()) return { status: 'unchanged' };
  return { status: 'ready', name: result.data };
}
