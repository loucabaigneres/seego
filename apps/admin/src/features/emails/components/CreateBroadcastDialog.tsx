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
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import type { CreateBroadcastMutation } from '@/features/emails/hooks/useEmailTemplates';
import type { EmailTemplate } from '@/features/emails/lib/labels';

/** Turns a published template into a draft broadcast to the waitlist segment. Sends nothing. */
export function CreateBroadcastDialog({
  template,
  createBroadcast,
  disabledReason,
}: {
  template: EmailTemplate;
  createBroadcast: CreateBroadcastMutation;
  disabledReason: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(template.name);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setName(template.name);
    createBroadcast.reset();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    createBroadcast.mutate(
      { templateId: template.id, name: name.trim() },
      { onSuccess: () => handleOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={disabledReason !== null}
            title={disabledReason ?? undefined}
          />
        }
      >
        Créer une campagne
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle campagne</DialogTitle>
          <DialogDescription>
            Crée un brouillon à partir de « {template.name} », adressé au segment Waitlist. Rien
            n’est envoyé à cette étape : tu pourras le relire sur Resend puis l’envoyer depuis la
            liste des campagnes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {createBroadcast.isError && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{createBroadcast.error.message}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="broadcast-name">Nom de la campagne</FieldLabel>
              <Input
                id="broadcast-name"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldDescription>Visible seulement dans l’admin et sur Resend.</FieldDescription>
            </Field>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
              <Button type="submit" disabled={name.trim() === '' || createBroadcast.isPending}>
                {createBroadcast.isPending && <Spinner data-icon="inline-start" />}
                Créer le brouillon
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
