import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { tripDisplayTitle } from '@/domain/trip-summary';
import { useAuthSession } from '@/hooks/useAuthSession';
import { trpc } from '@/lib/trpc';

import { titleChange } from '../lib/trip-title';
import type { Trip } from './useTrip';

/** "Renommer" sheet of the trip page. Only the owner may rename, as the API enforces. */
export function useTripRename(tripId: string, trip: Trip | null) {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  /** `null` while the sheet is closed. */
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const current = trip ? tripDisplayTitle(trip) : '';

  const mutation = useMutation(
    trpc.user.renameTrip.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: trpc.user.getTrips.queryKey() });
        // Awaited so the sheet closes on the new title, not the stale one.
        await queryClient.invalidateQueries({
          queryKey: trpc.discovery.getTrip.queryKey({ tripId }),
        });
        setDraft(null);
      },
      onError: () => setError('Impossible de renommer ton voyage pour le moment. Réessaie.'),
    }),
  );

  const value = draft ?? '';

  return {
    canRename: !!user && !!trip && trip.userId === user.id,
    isOpen: draft !== null,
    open: () => {
      setDraft(current);
      setError(null);
    },
    close: () => {
      if (!mutation.isPending) setDraft(null);
    },
    value,
    setValue: (next: string) => {
      setDraft(next);
      setError(null);
    },
    error,
    isSaving: mutation.isPending,
    canSave: titleChange(value, current).status !== 'unchanged',
    save: () => {
      const change = titleChange(value, current);
      if (change.status === 'invalid') return setError(change.error);
      if (change.status === 'unchanged') return setDraft(null);
      mutation.mutate({ tripId, title: change.title });
    },
  };
}
