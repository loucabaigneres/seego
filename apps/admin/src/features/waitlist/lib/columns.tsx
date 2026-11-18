import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/features';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';
import type { RouterOutputs } from '@/lib/trpc';

export type WaitlistLead = RouterOutputs['admin']['waitlist']['list']['items'][number];

const columnHelper = createColumnHelper<DataTableFeatures, WaitlistLead>();

const dash = <span className="text-muted-foreground">—</span>;
const optional = (value: string | null) => value || dash;

export const waitlistColumns = columnHelper.columns([
  columnHelper.accessor('email', {
    header: 'E-mail',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Inscription',
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.accessor('unsubscribedAt', {
    header: 'Statut',
    cell: (info) => {
      const unsubscribedAt = info.getValue();
      return unsubscribedAt ? (
        <Badge variant="secondary" title={`Désinscrit le ${formatDateTime(unsubscribedAt)}`}>
          Désinscrit
        </Badge>
      ) : (
        <Badge variant="success">Inscrit</Badge>
      );
    },
  }),
  columnHelper.accessor('utmSource', { header: 'Source', cell: (info) => optional(info.getValue()) }),
  columnHelper.accessor('utmMedium', { header: 'Medium', cell: (info) => optional(info.getValue()) }),
  columnHelper.accessor('utmCampaign', {
    header: 'Campagne',
    cell: (info) => optional(info.getValue()),
  }),
  columnHelper.accessor('utmContent', { header: 'Contenu', cell: (info) => optional(info.getValue()) }),
  columnHelper.accessor('referrer', {
    header: 'Referrer',
    cell: (info) => {
      const referrer = info.getValue();
      return referrer ? (
        <span className="block max-w-56 truncate" title={referrer}>
          {referrer}
        </span>
      ) : (
        dash
      );
    },
  }),
]);
