import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { matchesSearch } from '@/domain/search';
import { trpc, type RouterOutputs } from '@/lib/trpc';

import type { TripActivity } from './useTrip';

export type ReplacementCandidate = RouterOutputs['discovery']['getReplacementCandidates'][number];

/** `catalog`: Seego's places; `mine`: the places the user imported from an inspiration. */
export type CandidateSource = 'catalog' | 'mine';

/** The replacement sheet: candidates for one planned place, and picking one (saved at once). */
export function useReplacePlace(tripId: string) {
  const queryClient = useQueryClient();
  const [place, setPlace] = useState<TripActivity | null>(null);
  const [source, setSource] = useState<CandidateSource>('catalog');
  const [query, setQuery] = useState('');

  const candidates = useQuery({
    ...trpc.discovery.getReplacementCandidates.queryOptions({
      tripId,
      activityId: place?.id ?? '',
    }),
    enabled: place !== null,
  });

  const mutation = useMutation(
    trpc.discovery.replaceActivity.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: trpc.user.getTrips.queryKey() });
        await queryClient.invalidateQueries({
          queryKey: trpc.discovery.getTrip.queryKey({ tripId }),
        });
        setPlace(null);
      },
    }),
  );

  return {
    place,
    open: (activity: TripActivity) => {
      mutation.reset();
      setSource('catalog');
      setQuery('');
      setPlace(activity);
    },
    close: () => {
      if (!mutation.isPending) setPlace(null);
    },
    source,
    setSource,
    /** Filters both sources by name. */
    query,
    setQuery,
    candidates: {
      /** The candidates of the selected source matching the search, best first. */
      data: candidates.data?.filter(
        (c) => c.imported === (source === 'mine') && matchesSearch(query, [c.title]),
      ),
      isLoading: candidates.isPending,
      isError: candidates.isError,
      retry: () => candidates.refetch(),
    },
    pick: (candidateId: string) =>
      place && mutation.mutate({ tripId, activityId: place.id, discoveryContentId: candidateId }),
    pickingId: mutation.isPending ? mutation.variables?.discoveryContentId : undefined,
    errorMessage: mutation.isError
      ? mutation.error.message || 'Impossible de remplacer ce lieu.'
      : null,
  };
}

export type ReplacePlace = ReturnType<typeof useReplacePlace>;
