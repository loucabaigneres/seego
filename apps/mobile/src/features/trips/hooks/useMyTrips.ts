import { useQuery } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc';

import { mergeTrips } from '../lib/merge-trips';

/** The user's own trips and the group trips they joined. */
export function useMyTrips({ enabled = true }: { enabled?: boolean } = {}) {
  const owned = useQuery({ ...trpc.user.getTrips.queryOptions(), enabled });
  const groups = useQuery({ ...trpc.group.getMyGroupTrips.queryOptions(), enabled });

  return {
    trips: mergeTrips(owned.data ?? [], groups.data ?? []),
    isLoading: enabled && (owned.isPending || groups.isPending),
    hasFailed: owned.isError || groups.isError,
    retry: () => Promise.all([owned.refetch(), groups.refetch()]),
  };
}
