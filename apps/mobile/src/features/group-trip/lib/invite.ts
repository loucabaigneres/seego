/** The link a friend opens to join: the web page, which also works without the app. */
export function inviteUrl(webUrl: string, code: string) {
  return `${webUrl.replace(/\/+$/, '')}/join/${code}`;
}

/** Codes are valid 24 h. A trip without an expiry has no usable code. */
export function inviteStatus(expiresAt: string | Date | null | undefined, now = new Date()) {
  const msLeft = expiresAt ? new Date(expiresAt).getTime() - now.getTime() : 0;
  return { expired: msLeft <= 0, hoursLeft: Math.max(Math.ceil(msLeft / 3_600_000), 0) };
}

/** What was typed or pasted: a code (any case, spaces allowed) or the whole invite link. */
export function parseInviteCode(input: string): string | null {
  const raw = input.match(/\/join\/([^/?#\s]+)/)?.[1] ?? input;
  const code = raw.replace(/\s+/g, '').toUpperCase();
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

/** `joinGroupTrip` errors, by tRPC code. */
export function joinErrorMessage(code: string | undefined) {
  if (code === 'NOT_FOUND') return 'Ce code ne correspond à aucun voyage. Vérifie-le et réessaie.';
  if (code === 'BAD_REQUEST')
    return 'Ce lien a expiré. Demande un nouveau code à l’hôte du voyage.';
  return 'Impossible de rejoindre le voyage pour le moment. Réessaie.';
}
