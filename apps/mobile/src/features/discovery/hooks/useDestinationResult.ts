import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { trpc } from '@/lib/trpc';

import type { Swipe } from '../lib/deck';
import { bestDestination } from '../lib/recommendation';

/** The destination computed from the swipes, and the trip created from it. */
export function useDestinationResult(tripId: string, swipes: Swipe[]) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // The swipes are part of the key: reopening after more swipes computes again.
  const recommendation = useQuery({
    ...trpc.discovery.recommendation.queryOptions({ swipes, topN: 3 }),
    enabled: isOpen,
  });

  const saveTrip = useMutation(
    trpc.discovery.saveTrip.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.user.getTrips.queryKey() });
        router.push({ pathname: '/trip/configure', params: { tripId: data.tripId } });
      },
    }),
  );

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    destination: bestDestination(recommendation.data),
    confidence: recommendation.data?.confidence ?? 0,
    isLoading: recommendation.isPending,
    hasFailed: recommendation.isError,
    retry: () => recommendation.refetch(),
    save: () => saveTrip.mutate({ tripId, swipes }),
    isSaving: saveTrip.isPending,
    saveFailed: saveTrip.isError,
    reset: () => {
      setIsOpen(false);
      saveTrip.reset();
    },
  };
}
