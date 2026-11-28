import { CircleAlert, TriangleAlert } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import type { SendBroadcastMutation } from '@/features/emails/hooks/useBroadcasts';
import { BROADCAST_CONFIRMATION_WORD, type Broadcast, plural } from '@/features/emails/lib/labels';

/**
 * Last step before a campaign goes out: shows how many people will receive it and asks for
 * the confirmation word typed by hand (the API checks it again).
 */
export function SendBroadcastDialog({
  broadcast,
  recipients,
  send,
}: {
  broadcast: Broadcast;
  recipients: number | null;
  send: SendBroadcastMutation;
}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const confirmed = confirmation === BROADCAST_CONFIRMATION_WORD;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setConfirmation('');
    send.reset();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmed) return;
    send.mutate(
      { broadcastId: broadcast.id, confirmation: BROADCAST_CONFIRMATION_WORD },
      { onSuccess: () => handleOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>Envoyer…</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer « {broadcast.name} »</DialogTitle>
          <DialogDescription>
            La campagne part immédiatement au segment Waitlist
            {recipients !== null && <> : {plural(recipients, 'abonné')}</>}. Les désinscrits sont
            exclus automatiquement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Action irréversible</AlertTitle>
              <AlertDescription>
                Un e-mail envoyé ne peut pas être rappelé. Relis la campagne sur Resend et
                envoie-toi un test avant.
              </AlertDescription>
            </Alert>
            {send.isError && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{send.error.message}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="broadcast-confirmation">
                Tape {BROADCAST_CONFIRMATION_WORD} pour confirmer
              </FieldLabel>
              <Input
                id="broadcast-confirmation"
                autoComplete="off"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
              <Button type="submit" variant="destructive" disabled={!confirmed || send.isPending}>
                {send.isPending && <Spinner data-icon="inline-start" />}
                {recipients !== null
                  ? `Envoyer à ${plural(recipients, 'personne')}`
                  : 'Envoyer la campagne'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
