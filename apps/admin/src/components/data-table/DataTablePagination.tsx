import type { ReactTable, RowData } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { DataTableFeatures } from '@/components/data-table/features';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>;
  pageSizeOptions?: number[];
}

/** Reusable pagination bar from the shadcn data table guide (rows per page + first/prev/next/last). */
export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination;
  const pageCount = Math.max(1, table.getPageCount());

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Lignes par page</span>
        <Select
          items={pageSizeOptions.map((size) => ({ value: size, label: String(size) }))}
          value={pageSize}
          onValueChange={(value) => {
            if (value !== null) table.setPageSize(value);
          }}
        >
          <SelectTrigger size="sm" className="w-18" aria-label="Lignes par page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-muted-foreground">
        Page {pageIndex + 1} sur {pageCount}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Première page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.firstPage()}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Page précédente"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Page suivante"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Dernière page"
          disabled={!table.getCanLastPage()}
          onClick={() => table.lastPage()}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
