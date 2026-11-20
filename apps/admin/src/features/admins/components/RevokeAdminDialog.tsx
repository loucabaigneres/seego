import { CircleAlert } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import type { RevokeMutation } from '@/features/admins/hooks/useAdmins';

export function RevokeAdminDialog({
  admin,
  revoke,
}: {
  admin: { id: string; email: string };
  revoke: RevokeMutation;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setPassword('');
    revoke.reset();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    revoke.mutate(
      { userId: admin.id, password },
      { onSuccess: () => handleOpenChange(false), onError: () => setPassword('') },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>Retirer</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retirer le rôle administrateur</DialogTitle>
          <DialogDescription>
            {admin.email} perdra l’accès au back-office (son compte Seego reste actif). Tous les
            administrateurs seront prévenus par e-mail.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {revoke.isError && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{revoke.error.message}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="revoke-password">Ton mot de passe</FieldLabel>
              <Input
                id="revoke-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
              <Button
                type="submit"
                variant="destructive"
                disabled={password === '' || revoke.isPending}
              >
                {revoke.isPending && <Spinner data-icon="inline-start" />}
                Retirer
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
