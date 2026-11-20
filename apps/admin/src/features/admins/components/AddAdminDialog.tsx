import { UserPlus } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { CandidateLookupResult } from '@/features/admins/components/CandidateLookupResult';
import { useAdminCandidate } from '@/features/admins/hooks/useAdminCandidate';
import type { GrantMutation } from '@/features/admins/hooks/useAdmins';

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

        {candidate.email !== null && (
          <CandidateLookupResult query={candidate.query} grant={grant} onDone={close} />
        )}
      </DialogContent>
    </Dialog>
  );
}
