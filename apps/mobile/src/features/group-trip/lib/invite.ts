/** The link a friend opens to join: the web page, which also works without the app. */
export function inviteUrl(webUrl: string, code: string) {
  return `${webUrl.replace(/\/+$/, '')}/join/${code}`;
}

/** Codes are valid 24 h. A trip without an expiry has no usable code. */
export function inviteStatus(expiresAt: string | Date | null | undefined, now = new Date()) {
  const msLeft = expiresAt ? new Date(expiresAt).getTime() - now.getTime() : 0;
  return { expired: msLeft <= 0, hoursLeft: Math.max(Math.ceil(msLeft / 3_600_000), 0) };
}

/** Codes the API generates: 8 characters, one box each on the code screen. */
export const INVITE_CODE_LENGTH = 8;

/** What was typed or pasted: a code (any case, spaces allowed) or the whole invite link. */
export function parseInviteCode(input: string): string | null {
  const raw = input.match(/\/join\/([^/?#\s]+)/)?.[1] ?? input;
  // 12: the column's length, so older codes still fit.
  const code = raw.replace(/\s+/g, '').toUpperCase().slice(0, 12);
  return code || null;
}

export type GroupCardState = 'hidden' | 'sign-in' | 'invite' | 'active';

/**
 * The group card of the trip page: the group itself once it is one, otherwise the offer to
 * make it one, which only the owner may accept (and a guest must sign in for).
 */
export function groupCardState(
  trip: { isGroup: boolean; userId: string },
  userId: string | null | undefined,
): GroupCardState {
  if (trip.isGroup) return userId ? 'active' : 'sign-in';
  if (!userId) return 'sign-in';
  return trip.userId === userId ? 'invite' : 'hidden';
}

/** Welcome screen: "Léa, Tom et Inès t’attendent." — the other members, three named at most. */
export function waitingMembers(names: string[]): string | null {
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} t’attend.`;
  const shown = names.length > 3 ? [...names.slice(0, 2), `${names.length - 2} autres`] : names;
  return `${shown.slice(0, -1).join(', ')} et ${shown.at(-1)} t’attendent.`;
}

/** A code the API refused for good (unknown or expired): retrying it would not help. */
export function isCodeRejected(code: string | undefined) {
  return code === 'NOT_FOUND' || code === 'BAD_REQUEST';
}

/** `joinGroupTrip` errors, by tRPC code. */
export function joinErrorMessage(code: string | undefined) {
  if (code === 'NOT_FOUND')
    return {
      title: 'Code introuvable',
      message: 'Ce code ne correspond à aucun voyage. Vérifie-le et réessaie.',
    };
  if (code === 'BAD_REQUEST')
    return {
      title: 'Ce code a expiré',
      message: 'Il n’était valable que 24 h. Demande à l’organisateur de t’en envoyer un nouveau.',
    };
  return {
    title: 'Impossible de rejoindre',
    message: 'Impossible de rejoindre le voyage pour le moment. Réessaie.',
  };
}
