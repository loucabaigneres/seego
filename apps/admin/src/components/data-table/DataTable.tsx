import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  useTable,
} from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DataTablePagination } from '@/components/data-table/DataTablePagination';
import { dataTableFeatures, type DataTableFeatures } from '@/components/data-table/features';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData extends RowData> {
  // `any`: each column has its own value type (same as TanStack's own `columnHelper.columns`).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<DataTableFeatures, TData, any>[];
  data: TData[];
  /** Total number of rows on the server, for the page count. */
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageSizeOptions?: number[];
  /** Dims the rows while the next page is loading (previous page kept on screen). */
  isFetching?: boolean;
  emptyMessage?: ReactNode;
}

/** shadcn/ui data table (https://ui.shadcn.com/docs/components/base/data-table), server-side paginated. */
export function DataTable<TData extends RowData>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
  pageSizeOptions,
  isFetching = false,
  emptyMessage = 'Aucun résultat.',
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    manualPagination: true,
    rowCount,
    state: { pagination },
    onPaginationChange,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border bg-background">
        <Table className={cn('transition-opacity', isFetching && 'opacity-60')}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}
