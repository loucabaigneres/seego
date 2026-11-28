/**
 * Pure safety rules for granting/revoking the back-office 'admin' role, kept apart from
 * the tRPC procedures so they can be unit-tested. Each check returns the French message
 * to show, or null when the change is allowed.
 */

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export type RoleCandidate = {
  id: string;
  email: string;
  emailVerified: boolean;
  role: string | null;
  banned: boolean | null;
};

export function grantRefusal(
  target: RoleCandidate | undefined,
  confirmEmail: string,
): string | null {
  if (!target) return 'Aucun compte ne correspond.';
  // The admin retyped the address: a mismatch means the wrong account was picked.
  if (normalizeEmail(confirmEmail) !== normalizeEmail(target.email)) {
    return "L'e-mail de confirmation ne correspond pas au compte sélectionné.";
  }
  if (target.role === 'admin') return 'Ce compte est déjà administrateur.';
  // The owner must have proved they control the mailbox (typo'd sign-ups stay unverified).
  if (!target.emailVerified) return "Ce compte n'a pas encore vérifié son e-mail.";
  if (target.banned) return 'Ce compte est banni.';
  return null;
}

export function revokeRefusal(
  target: RoleCandidate | undefined,
  actorId: string,
  adminIds: string[],
): string | null {
  if (!target || target.role !== 'admin') return "Ce compte n'est pas administrateur.";
  if (target.id === actorId) return 'Tu ne peux pas retirer ton propre rôle administrateur.';
  // Never true while the actor is an admin, but guards against concurrent revocations.
  if (adminIds.filter((id) => id !== target.id).length === 0) {
    return 'Il doit rester au moins un administrateur.';
  }
  return null;
}
