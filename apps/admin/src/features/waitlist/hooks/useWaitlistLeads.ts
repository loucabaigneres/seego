import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PaginationState } from '@tanstack/react-table';
import { useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { type RouterInputs, trpc } from '@/lib/trpc';

export type WaitlistStatus = NonNullable<RouterInputs['admin']['waitlist']['list']['status']>;

const FIRST_PAGE: PaginationState = { pageIndex: 0, pageSize: 25 };

/** Owns the filters/pagination state of the waitlist screen and the matching tRPC query. */
export function useWaitlistLeads() {
  const [pagination, setPagination] = useState<PaginationState>(FIRST_PAGE);
  const [search, setSearchValue] = useState('');
  const [status, setStatusValue] = useState<WaitlistStatus>('all');
  const debouncedSearch = useDebouncedValue(search.trim());

  const query = useQuery({
    ...trpc.admin.waitlist.list.queryOptions({
      // TanStack Table pages are 0-based, the API's are 1-based.
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: debouncedSearch || undefined,
      status,
    }),
    // Keeps the current page on screen while the next one loads (no flash of skeletons).
    placeholderData: keepPreviousData,
  });

  // A new filter always starts back on the first page.
  const resetPage = () => setPagination((current) => ({ ...current, pageIndex: 0 }));

  return {
    query,
    pagination,
    setPagination,
    search,
    setSearch: (value: string) => {
      setSearchValue(value);
      resetPage();
    },
    status,
    setStatus: (value: WaitlistStatus) => {
      setStatusValue(value);
      resetPage();
    },
    hasFilters: search.trim() !== '' || status !== 'all',
  };
}
