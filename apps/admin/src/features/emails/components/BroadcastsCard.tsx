import { ExternalLink } from 'lucide-react';
import { ErrorState } from '@/components/QueryState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RemoveBroadcastDialog } from '@/features/emails/components/RemoveBroadcastDialog';
import { SendBroadcastDialog } from '@/features/emails/components/SendBroadcastDialog';
import { useBroadcasts } from '@/features/emails/hooks/useBroadcasts';
import { BROADCAST_STATUS, resendBroadcastUrl } from '@/features/emails/lib/labels';
import { formatDateTime } from '@/lib/format';

export function BroadcastsCard({
  campaignsEnabled,
  recipients,
}: {
  campaignsEnabled: boolean;
  recipients: number | null;
}) {
  const { query, send, remove } = useBroadcasts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campagnes</CardTitle>
        <CardDescription>
          Broadcasts Resend. Crée un brouillon depuis un template, relis-le sur Resend, puis
          envoie-le d’ici.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState
            description="Impossible de charger les campagnes Resend."
            onRetry={() => void query.refetch()}
          />
        ) : query.data.broadcasts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune campagne pour l’instant. Crée-en une depuis un template ci-dessus.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campagne</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Créée</TableHead>
                <TableHead>Envoyée</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.broadcasts.map((broadcast) => {
                const status = BROADCAST_STATUS[broadcast.status];
                const canSend =
                  campaignsEnabled && broadcast.status === 'draft' && broadcast.targetsWaitlist;
                return (
                  <TableRow key={broadcast.id}>
                    <TableCell className="font-medium">{broadcast.name}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {broadcast.targetsWaitlist ? 'Waitlist' : 'Autre segment'}
                    </TableCell>
                    <TableCell>{formatDateTime(broadcast.createdAt)}</TableCell>
                    <TableCell>
                      {broadcast.sentAt ? formatDateTime(broadcast.sentAt) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {canSend && (
                          <SendBroadcastDialog
                            broadcast={broadcast}
                            recipients={recipients}
                            send={send}
                          />
                        )}
                        {broadcast.status === 'draft' && (
                          <RemoveBroadcastDialog broadcast={broadcast} remove={remove} />
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false}
                          aria-label={`Ouvrir ${broadcast.name} sur Resend`}
                          render={
                            <a
                              href={resendBroadcastUrl(broadcast.id)}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                        >
                          <ExternalLink />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
