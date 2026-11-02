import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc';
import { moveToDay, moveWithinDay, removeFromDay } from '../lib/draftPlanning';
import { splitTripDays, toDraft } from '../lib/tripDays';
import type { Activity, Day } from '../types';

/**
 * Trip page state: the trip itself, itinerary generation, saving to the account
 * (automatic once signed in), replacing a place and editing the planning.
 */
export function useTrip(tripId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const [showSavedBanner, setShowSavedBanner] = useState(false);

  const query = useQuery(trpc.discovery.getTrip.queryOptions({ tripId }));

  const generateMutation = useMutation(
    trpc.discovery.generateItinerary.mutationOptions({
      onSuccess: () => query.refetch(),
    }),
  );

  /** Place whose replacement pop-up is open. */
  const [replacing, setReplacing] = useState<Activity | null>(null);
  const closeReplace = useCallback(() => setReplacing(null), []);
  const { refetch: refetchTrip } = query;
  const handleReplaced = useCallback(() => {
    setReplacing(null);
    refetchTrip();
  }, [refetchTrip]);

  /** Planning being edited; `null` outside edit mode. */
  const [draft, setDraft] = useState<Day[] | null>(null);

  const updatePlanningMutation = useMutation(
    trpc.discovery.updatePlanning.mutationOptions({
      onSuccess: async () => {
        await query.refetch();
        setDraft(null);
      },
    }),
  );

  const { mutate: saveToProfile, isPending: isSavingTrip } = useMutation(
    trpc.user.saveTripToAccount.mutationOptions({
      onSuccess: () => {
        query.refetch();
        queryClient.invalidateQueries(trpc.user.getProfile.queryFilter());
        queryClient.invalidateQueries(trpc.user.getTrips.queryFilter());
        setShowSavedBanner(true);
        setTimeout(() => setShowSavedBanner(false), 5000);
      },
    }),
  );

  useEffect(() => {
    if (
      session?.user &&
      query.data?.trip &&
      query.data.trip.userId !== session.user.id &&
      !isSavingTrip
    ) {
      saveToProfile({ tripId });
    }
  }, [session?.user, query.data?.trip, tripId, saveToProfile, isSavingTrip]);

  const trip = query.data?.trip;
  const isLoggedIn = Boolean(session?.user);
  const isOwner = Boolean(session?.user && trip && trip.userId === session.user.id);

  const saveTrip = () => {
    if (!session?.user) {
      navigate({
        to: '/login',
        search: { redirect: `/trip/${tripId}` },
      });
      return;
    }
    saveToProfile({ tripId });
  };

  const startEditing = () => {
    updatePlanningMutation.reset();
    setDraft(toDraft(splitTripDays(query.data?.days ?? []).itineraryDays));
  };

  const saveDraft = () => {
    if (!draft) return;
    updatePlanningMutation.mutate({
      tripId,
      days: draft.map((d) => ({ dayId: d.id, activityIds: d.activities.map((a) => a.id) })),
    });
  };

  /** Edit callbacks for one day of the draft. */
  const editDay = (dayId: string) => ({
    onMove: (activityId: string, offset: -1 | 1) =>
      setDraft((d) => d && moveWithinDay(d, dayId, activityId, offset)),
    onMoveToDay: (activityId: string, targetDayId: string) =>
      setDraft((d) => d && moveToDay(d, dayId, activityId, targetDayId)),
    onRemove: (activityId: string) => setDraft((d) => d && removeFromDay(d, dayId, activityId)),
  });

  return {
    query,
    isLoggedIn,
    isOwner,
    save: {
      run: saveTrip,
      isPending: isSavingTrip,
      showBanner: showSavedBanner,
      closeBanner: () => setShowSavedBanner(false),
    },
    generate: {
      run: () => generateMutation.mutate({ tripId }),
      isPending: generateMutation.isPending,
      errorMessage: generateMutation.isError
        ? ((generateMutation.error as { message?: string })?.message ??
          'Erreur lors de la génération.')
        : null,
    },
    replace: {
      place: replacing,
      open: setReplacing,
      close: closeReplace,
      onReplaced: handleReplaced,
    },
    edit: {
      draft,
      start: startEditing,
      cancel: () => setDraft(null),
      save: saveDraft,
      editDay,
      isPending: updatePlanningMutation.isPending,
      errorMessage: updatePlanningMutation.isError
        ? updatePlanningMutation.error.message || "Impossible d'enregistrer le planning."
        : null,
    },
  };
}
