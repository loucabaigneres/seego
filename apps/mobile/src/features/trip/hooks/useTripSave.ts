import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useRef } from 'react';

import { useAuthSession } from '@/hooks/useAuthSession';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc';

import { tripSaveState } from '../lib/trip-save';
import type { Trip } from './useTrip';

/**
 * "Enregistrer dans mon profil". A guest is sent to sign in first; back on the trip, the save
 * is made once if they did sign in, and dropped if they gave up.
 */
export function useTripSave(tripId: string, trip: Trip | null) {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const isSavePending = useRef(false);

  const mutation = useMutation(
    trpc.user.saveTripToAccount.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.discovery.getTrip.queryKey({ tripId }) });
        queryClient.invalidateQueries({ queryKey: trpc.user.pathKey() });
      },
    }),
  );
  const state = trip ? tripSaveState(trip, user?.id) : 'sign-in';
  const { mutate } = mutation;

  // The trip screen loses focus under the auth modal and gets it back when the modal closes.
  // The session is read from the server: `useSession` may not have caught up with it yet.
  useFocusEffect(
    useCallback(() => {
      if (!isSavePending.current) return;
      isSavePending.current = false;
      void authClient.getSession().then(({ data }) => {
        if (trip && tripSaveState(trip, data?.user.id) === 'save') mutate({ tripId });
      });
    }, [trip, mutate, tripId]),
  );

  const signInToSave = (href: Href) => {
    isSavePending.current = true;
    router.push(href);
  };

  return {
    state,
    run: () => (state === 'save' ? mutation.mutate({ tripId }) : signInToSave('/auth/sign-in')),
    signUp: () => signInToSave('/auth/sign-up'),
    isPending: mutation.isPending,
    failed: mutation.isError,
  };
}
