import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/QueryState';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddAdminDialog } from '@/features/admins/components/AddAdminDialog';
import { RevokeAdminDialog } from '@/features/admins/components/RevokeAdminDialog';
import { useAdmins } from '@/features/admins/hooks/useAdmins';
import { formatDateTime } from '@/lib/format';

export function AdminsPage({ currentUserId }: { currentUserId: string }) {
  const { query, grant, revoke } = useAdmins();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-section">Administrateurs</h1>
          <p className="text-sm text-muted-foreground">Comptes ayant accès au back-office</p>
        </div>
        <AddAdminDialog grant={grant} />
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          description="Impossible de charger les administrateurs."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Compte créé</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{formatDateTime(admin.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {admin.id === currentUserId ? (
                      <Badge variant="outline">Toi</Badge>
                    ) : (
                      <RevokeAdminDialog admin={admin} revoke={revoke} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
              <CardDescription>Les 20 derniers changements de rôle</CardDescription>
            </CardHeader>
            <CardContent>
              {query.data.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun changement enregistré.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {query.data.events.map((event) => (
                    <li key={event.id} className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDateTime(event.createdAt)}
                      </span>
                      {event.action === 'grant' ? (
                        <Badge variant="success">Ajout</Badge>
                      ) : (
                        <Badge variant="secondary">Retrait</Badge>
                      )}
                      <span className="font-medium">{event.targetEmail}</span>
                      <span className="text-muted-foreground">
                        par {event.actorEmail ?? 'script db:promote-admin'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
