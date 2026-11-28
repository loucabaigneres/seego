import type { RouterOutputs } from '@/lib/trpc';

export type Candidate = NonNullable<RouterOutputs['admin']['admins']['lookup']>;

/** Same rules as the API (`grantRefusal`), so the admin knows before typing their password. */
export function grantBlockingReason(candidate: Candidate) {
  if (candidate.role === 'admin') return 'Ce compte est déjà administrateur.';
  if (!candidate.emailVerified) {
    return 'Ce compte n’a pas encore vérifié son e-mail : demande à la personne de le faire depuis l’app.';
  }
  if (candidate.banned) return 'Ce compte est banni.';
  return null;
}
