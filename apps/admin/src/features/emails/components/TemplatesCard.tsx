import { CircleAlert, CircleCheck, ExternalLink, Send } from 'lucide-react';
import { ErrorState } from '@/components/QueryState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateBroadcastDialog } from '@/features/emails/components/CreateBroadcastDialog';
import { useEmailTemplates } from '@/features/emails/hooks/useEmailTemplates';
import { resendTemplateUrl, TEMPLATE_STATUS, UNSUBSCRIBE_LINK } from '@/features/emails/lib/labels';
import { formatDateTime } from '@/lib/format';

export function TemplatesCard({ campaignsEnabled }: { campaignsEnabled: boolean }) {
  const { query, sendTest, createBroadcast } = useEmailTemplates();
  const testingId = sendTest.isPending ? sendTest.variables.templateId : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates</CardTitle>
        <CardDescription>
          Templates Resend. Pour devenir une campagne, un template de newsletter doit contenir le
          lien de désinscription Seego{' {{{contact.unsubscribe_url}}}'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sendTest.isSuccess && (
          <Alert>
            <CircleCheck />
            <AlertDescription>
              Test envoyé à {sendTest.data.to}. Le lien de désinscription n’est rempli que dans une
              vraie campagne.
            </AlertDescription>
          </Alert>
        )}
        {sendTest.isError && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{sendTest.error.message}</AlertDescription>
          </Alert>
        )}

        {query.isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState
            description="Impossible de charger les templates Resend."
            onRetry={() => void query.refetch()}
          />
        ) : query.data.templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun template sur Resend.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Désinscription</TableHead>
                <TableHead>Modifié</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.templates.map((template) => {
                const status = TEMPLATE_STATUS[template.status];
                const disabledReason = !campaignsEnabled
                  ? 'Campagnes désactivées sur cet environnement'
                  : template.broadcastIssues.length > 0
                    ? template.broadcastIssues.join(' · ')
                    : null;
                return (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.alias ?? template.id}
                          {template.subject && ` · ${template.subject}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {template.hasUnpublishedVersions && (
                          <Badge variant="outline">Modifs non publiées</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.unsubscribeLink ? (
                        <Badge variant={UNSUBSCRIBE_LINK[template.unsubscribeLink].variant}>
                          {UNSUBSCRIBE_LINK[template.unsubscribeLink].label}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucun</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(template.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={template.status !== 'published' || sendTest.isPending}
                          title={
                            template.status !== 'published'
                              ? 'Publie le template sur Resend pour l’envoyer en test'
                              : 'Envoie ce template à ton adresse uniquement'
                          }
                          onClick={() => sendTest.mutate({ templateId: template.id })}
                        >
                          {testingId === template.id ? (
                            <Spinner data-icon="inline-start" />
                          ) : (
                            <Send data-icon="inline-start" />
                          )}
                          M’envoyer un test
                        </Button>
                        <CreateBroadcastDialog
                          template={template}
                          createBroadcast={createBroadcast}
                          disabledReason={disabledReason}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false}
                          aria-label={`Ouvrir ${template.name} sur Resend`}
                          render={
                            <a
                              href={resendTemplateUrl(template.id)}
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
