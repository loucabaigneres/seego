import { CircleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmGrantForm } from '@/features/admins/components/ConfirmGrantForm';
import type { useAdminCandidate } from '@/features/admins/hooks/useAdminCandidate';
import type { GrantMutation } from '@/features/admins/hooks/useAdmins';

/** Step 1 outcome: lookup error (with retry), no account, or the confirmation form. */
export function CandidateLookupResult({
  query,
  grant,
  onDone,
}: {
  query: ReturnType<typeof useAdminCandidate>['query'];
  grant: GrantMutation;
  onDone: () => void;
}) {
  if (query.isPending) return null;

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Recherche impossible</AlertTitle>
        <AlertDescription>
          {query.error.message}{' '}
          <Button variant="link" size="sm" onClick={() => void query.refetch()}>
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (query.data === null) {
    return (
      <Alert>
        <CircleAlert />
        <AlertTitle>Aucun compte avec cet e-mail</AlertTitle>
        <AlertDescription>
          Vérifie l’orthographe exacte. La personne doit d’abord créer son compte sur l’app.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ConfirmGrantForm key={query.data.id} candidate={query.data} grant={grant} onDone={onDone} />
  );
}
