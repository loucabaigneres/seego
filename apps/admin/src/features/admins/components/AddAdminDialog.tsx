import { CircleAlert, ShieldCheck, UserPlus } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAdminCandidate } from '@/features/admins/hooks/useAdminCandidate';
import type { GrantMutation } from '@/features/admins/hooks/useAdmins';
import { providerLabel, sameEmail } from '@/features/admins/lib/providers';
import { formatDateTime } from '@/lib/format';
import type { RouterOutputs } from '@/lib/trpc';

type Candidate = NonNullable<RouterOutputs['admin']['admins']['lookup']>;

/**
 * Two-step promotion: 1. exact e-mail lookup showing who the account belongs to,
 * 2. the e-mail typed again by hand + the admin's password. The API re-checks everything.
 */
export function AddAdminDialog({ grant }: { grant: GrantMutation }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const candidate = useAdminCandidate();

  const close = () => {
    setOpen(false);
    setEmail('');
    candidate.reset();
    grant.reset();
  };

  const handleSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    grant.reset();
    candidate.search(email.trim().toLowerCase());
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogTrigger render={<Button />}>
        <UserPlus data-icon="inline-start" />
        Ajouter un administrateur
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur</DialogTitle>
          <DialogDescription>
            Le compte doit déjà exister sur Seego et avoir vérifié son e-mail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="admin-search-email">E-mail du compte</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="admin-search-email"
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    candidate.reset();
                  }}
                />
                <Button type="submit" variant="outline" disabled={candidate.query.isFetching}>
                  {candidate.query.isFetching && <Spinner data-icon="inline-start" />}
                  Rechercher
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>

        {candidate.email !== null &&
          (candidate.query.isPending ? null : candidate.query.isError ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Recherche impossible</AlertTitle>
              <AlertDescription>
                {candidate.query.error.message}{' '}
                <Button variant="link" size="sm" onClick={() => void candidate.query.refetch()}>
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          ) : candidate.query.data === null ? (
            <Alert>
              <CircleAlert />
              <AlertTitle>Aucun compte avec cet e-mail</AlertTitle>
              <AlertDescription>
                Vérifie l’orthographe exacte. La personne doit d’abord créer son compte sur l’app.
              </AlertDescription>
            </Alert>
          ) : (
            <ConfirmGrant
              key={candidate.query.data.id}
              candidate={candidate.query.data}
              grant={grant}
              onDone={close}
            />
          ))}
      </DialogContent>
    </Dialog>
  );
}

function CandidateSummary({ candidate }: { candidate: Candidate }) {
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

/** Same rules as the API (`grantRefusal`), so the admin knows before typing their password. */
function blockingReason(candidate: Candidate) {
  if (candidate.role === 'admin') return 'Ce compte est déjà administrateur.';
  if (!candidate.emailVerified) {
    return 'Ce compte n’a pas encore vérifié son e-mail : demande à la personne de le faire depuis l’app.';
  }
  if (candidate.banned) return 'Ce compte est banni.';
  return null;
}

function ConfirmGrant({
  candidate,
  grant,
  onDone,
}: {
  candidate: Candidate;
  grant: GrantMutation;
  onDone: () => void;
}) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const blocked = blockingReason(candidate);
  const confirmed = sameEmail(confirmEmail, candidate.email);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    grant.mutate(
      { userId: candidate.id, confirmEmail: confirmEmail.trim(), password },
      { onSuccess: onDone, onError: () => setPassword('') },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <CandidateSummary candidate={candidate} />

      {blocked ? (
        <Alert>
          <CircleAlert />
          <AlertDescription>{blocked}</AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Alert>
              <ShieldCheck />
              <AlertDescription>
                Ce compte aura accès à tout le back-office. Le compte concerné et tous les
                administrateurs seront prévenus par e-mail.
              </AlertDescription>
            </Alert>
            {grant.isError && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{grant.error.message}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="admin-confirm-email">Retape l’e-mail pour confirmer</FieldLabel>
              <Input
                id="admin-confirm-email"
                type="email"
                required
                autoComplete="off"
                // Typed by hand on purpose: copy-pasting would also copy a typo.
                onPaste={(e) => e.preventDefault()}
                aria-invalid={confirmEmail !== '' && !confirmed}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-confirm-password">Ton mot de passe</FieldLabel>
              <Input
                id="admin-confirm-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription>
                Requis pour toute modification des administrateurs.
              </FieldDescription>
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={!confirmed || password === '' || grant.isPending}>
                {grant.isPending && <Spinner data-icon="inline-start" />}
                Donner le rôle administrateur
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      )}
    </div>
  );
}
