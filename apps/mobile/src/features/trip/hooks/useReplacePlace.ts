import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { matchesSearch } from '@/domain/search';
import { trpc, type RouterOutputs } from '@/lib/trpc';

import type { TripActivity } from './useTrip';

export type ReplacementCandidate = RouterOutputs['discovery']['getReplacementCandidates'][number];

/** `catalog`: Seego's places; `mine`: the places the user imported from an inspiration. */
export type CandidateSource = 'catalog' | 'mine';

/** The replacement sheet: candidates for one planned place, one picked, then confirmed. */
export function useReplacePlace(tripId: string) {
  const queryClient = useQueryClient();
  const [place, setPlace] = useState<TripActivity | null>(null);
  /** The place's step in its day, as numbered in the timeline. */
  const [step, setStep] = useState(1);
  const [source, setSource] = useState<CandidateSource>('catalog');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  /** The candidates of the selected source matching the search, best first. */
  const shown = candidates.data?.filter(
    (c) => c.imported === (source === 'mine') && matchesSearch(query, [c.title]),
  );
  // Derived from the shown list: a pick hidden by the search can't be confirmed.
  const selected = shown?.find((c) => c.id === selectedId) ?? null;

  return {
    place,
    step,
    open: (activity: TripActivity, activityStep: number) => {
      mutation.reset();
      setSource('catalog');
      setQuery('');
      setSelectedId(null);
      setStep(activityStep);
      setPlace(activity);
    },
    close: () => {
      if (!mutation.isPending) setPlace(null);
    },
    source,
    setSource: (next: CandidateSource) => {
      setSource(next);
      setSelectedId(null);
    },
    /** Filters both sources by name. */
    query,
    setQuery,
    candidates: {
      data: shown,
      isLoading: candidates.isPending,
      isError: candidates.isError,
      retry: () => candidates.refetch(),
    },
    selected,
    select: setSelectedId,
    confirm: () =>
      place &&
      selected &&
      mutation.mutate({ tripId, activityId: place.id, discoveryContentId: selected.id }),
    isReplacing: mutation.isPending,
    errorMessage: mutation.isError
      ? mutation.error.message || 'Impossible de remplacer ce lieu.'
      : null,
  };
}

export type ReplacePlace = ReturnType<typeof useReplacePlace>;
