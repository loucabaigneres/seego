import { Search } from 'lucide-react';
import { DataTable } from '@/components/data-table/DataTable';
import { ErrorState } from '@/components/QueryState';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useWaitlistLeads, type WaitlistStatus } from '@/features/waitlist/hooks/useWaitlistLeads';
import { waitlistColumns } from '@/features/waitlist/lib/columns';

const STATUS_OPTIONS: { value: WaitlistStatus; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'subscribed', label: 'Inscrits' },
  { value: 'unsubscribed', label: 'Désinscrits' },
];

export function WaitlistTable() {
  const { query, pagination, setPagination, search, setSearch, status, setStatus, hasFilters } =
    useWaitlistLeads();
  const total = query.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-section text-foreground">Waitlist</h1>
          <p className="text-sm text-muted-foreground">
            {query.isSuccess
              ? `${total} inscrit${total > 1 ? 's' : ''}${hasFilters ? ' (filtrés)' : ''}`
              : 'Inscrits depuis la landing page'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un e-mail"
              aria-label="Rechercher un e-mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-8"
            />
          </div>
          <Select
            items={STATUS_OPTIONS}
            value={status}
            onValueChange={(value) => {
              if (value !== null) setStatus(value);
            }}
          >
            <SelectTrigger aria-label="Filtrer par statut" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState message="Impossible de charger la waitlist." onRetry={() => void query.refetch()} />
      ) : (
        <DataTable
          columns={waitlistColumns}
          data={query.data.items}
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isFetching={query.isPlaceholderData}
          emptyMessage={
            hasFilters ? 'Aucun inscrit ne correspond à ces filtres.' : 'Personne ne s’est encore inscrit.'
          }
        />
      )}
    </div>
  );
}
