import { CircleAlert, ShieldCheck } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { CandidateSummary } from '@/features/admins/components/CandidateSummary';
import type { GrantMutation } from '@/features/admins/hooks/useAdmins';
import { type Candidate, grantBlockingReason } from '@/features/admins/lib/candidate';
import { sameEmail } from '@/features/admins/lib/providers';

/** Step 2: the e-mail typed again by hand + the admin's password. The API re-checks everything. */
export function ConfirmGrantForm({
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
  const blocked = grantBlockingReason(candidate);
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
