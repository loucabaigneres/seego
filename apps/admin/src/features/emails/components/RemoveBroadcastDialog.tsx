import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import type { RemoveBroadcastMutation } from '@/features/emails/hooks/useBroadcasts';
import type { Broadcast } from '@/features/emails/lib/labels';

export function RemoveBroadcastDialog({
  broadcast,
  remove,
}: {
  broadcast: Broadcast;
  remove: RemoveBroadcastMutation;
}) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    remove.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>Supprimer</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le brouillon</DialogTitle>
          <DialogDescription>
            « {broadcast.name} » sera supprimé de Resend. Le template d’origine n’est pas touché.
          </DialogDescription>
        </DialogHeader>
        {remove.isError && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{remove.error.message}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(
                { broadcastId: broadcast.id },
                { onSuccess: () => handleOpenChange(false) },
              )
            }
          >
            {remove.isPending && <Spinner data-icon="inline-start" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
