import { Badge } from '@/components/ui/badge';
import type { Candidate } from '@/features/admins/lib/candidate';
import { providerLabel } from '@/features/admins/lib/providers';
import { formatDateTime } from '@/lib/format';

/** What the admin needs to recognise the account before promoting it. */
export function CandidateSummary({ candidate }: { candidate: Candidate }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border p-3">
      <dt className="text-muted-foreground">Nom</dt>
      <dd className="font-medium">{candidate.name}</dd>
      <dt className="text-muted-foreground">E-mail</dt>
      <dd className="font-medium break-all">{candidate.email}</dd>
      <dt className="text-muted-foreground">Compte créé</dt>
      <dd>{formatDateTime(candidate.createdAt)}</dd>
      <dt className="text-muted-foreground">Connexion</dt>
      <dd>{candidate.providers.map(providerLabel).join(', ') || '—'}</dd>
      <dt className="text-muted-foreground">Statut</dt>
      <dd className="flex flex-wrap gap-1">
        {candidate.emailVerified ? (
          <Badge variant="success">E-mail vérifié</Badge>
        ) : (
          <Badge variant="secondary">E-mail non vérifié</Badge>
        )}
        {candidate.role === 'admin' && <Badge>Administrateur</Badge>}
        {candidate.banned && <Badge variant="destructive">Banni</Badge>}
      </dd>
    </dl>
  );
}
