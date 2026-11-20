import { rowPaginationFeature, tableFeatures } from '@tanstack/react-table';

/**
 * TanStack Table v9 features shared by every back-office table (declared once, outside
 * components, as the docs recommend). Pagination, filters and sorting happen in the API,
 * so only the pagination state lives in the table (`manualPagination`).
 */
export const dataTableFeatures = tableFeatures({ rowPaginationFeature });

export type DataTableFeatures = typeof dataTableFeatures;
