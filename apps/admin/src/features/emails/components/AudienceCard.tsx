import { CircleAlert, CircleCheck, Info, RefreshCw } from 'lucide-react';
import { ErrorState } from '@/components/QueryState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useAudience } from '@/features/emails/hooks/useAudience';
import { IMPORT_STATUS, isImportRunning, plural } from '@/features/emails/lib/labels';
import { formatDateTime } from '@/lib/format';

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function AudienceCard() {
  const { overview, sync } = useAudience();
  const data = overview.data;
  const importRunning = isImportRunning(data?.lastImport?.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience newsletter</CardTitle>
        <CardDescription>
          Inscrits de la waitlist, copiés dans le segment Resend « Waitlist » ciblé par les
          campagnes.
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.syncEnabled || sync.isPending || importRunning}
            onClick={() => sync.mutate()}
          >
            {sync.isPending || importRunning ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Synchroniser vers Resend
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {overview.isPending ? (
          <Skeleton className="h-24" />
        ) : overview.isError ? (
          <ErrorState
            description="Impossible de charger l’audience."
            onRetry={() => void overview.refetch()}
          />
        ) : (
          <>
            {!overview.data.syncEnabled && (
              <Alert>
                <Info />
                <AlertTitle>Synchronisation désactivée sur cet environnement</AlertTitle>
                <AlertDescription>
                  Seules les adresses de production vont dans Resend. Les campagnes s’activent quand
                  RESEND_WAITLIST_SEGMENT_ID est défini côté API.
                </AlertDescription>
              </Alert>
            )}

            {sync.isSuccess && (
              <Alert>
                <CircleCheck />
                <AlertDescription>
                  {sync.data.importId
                    ? `Import lancé : ${plural(sync.data.total, 'adresse')} envoyée${sync.data.total > 1 ? 's' : ''} à Resend.`
                    : 'Aucun inscrit à synchroniser.'}
                  {sync.data.reconciled > 0 &&
                    ` ${plural(sync.data.reconciled, 'désinscription')} faite${sync.data.reconciled > 1 ? 's' : ''} sur Resend reportée${sync.data.reconciled > 1 ? 's' : ''} en base.`}
                </AlertDescription>
              </Alert>
            )}
            {sync.isError && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{sync.error.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <span className="type-label">Base Seego (waitlist)</span>
                <div className="grid grid-cols-3 gap-4">
                  <Stat label="Total" value={overview.data.leads.total} />
                  <Stat label="Abonnés" value={overview.data.leads.subscribed} />
                  <Stat label="Désinscrits" value={overview.data.leads.unsubscribed} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="type-label">Resend (segment Waitlist)</span>
                {overview.data.audience ? (
                  <div className="grid grid-cols-3 gap-4">
                    <Stat
                      label="Total"
                      value={`${overview.data.audience.total}${overview.data.audience.truncated ? '+' : ''}`}
                    />
                    <Stat label="Abonnés" value={overview.data.audience.subscribed} />
                    <Stat label="Désinscrits" value={overview.data.audience.unsubscribed} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Non synchronisé ici.</p>
                )}
              </div>
            </div>

            {overview.data.lastImport && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Dernier import :</span>
                <Badge variant={IMPORT_STATUS[overview.data.lastImport.status].variant}>
                  {IMPORT_STATUS[overview.data.lastImport.status].label}
                </Badge>
                <span>{formatDateTime(overview.data.lastImport.createdAt)}</span>
                <span className="text-muted-foreground">
                  {overview.data.lastImport.counts.created} créés ·{' '}
                  {overview.data.lastImport.counts.updated} mis à jour ·{' '}
                  {overview.data.lastImport.counts.failed} en échec
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
