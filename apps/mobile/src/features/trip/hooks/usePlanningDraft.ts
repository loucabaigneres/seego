import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePreventRemove } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

import { trpc } from '@/lib/trpc';

import {
  isDraftDirty,
  moveToDay,
  moveWithinDay,
  removeFromDay,
  toDraft,
  toPlanningInput,
} from '../lib/planning-edits';
import type { TripDay } from './useTrip';

const DISCARD_TITLE = 'Abandonner les modifications ?';
const DISCARD_MESSAGE = 'Tes changements du planning ne seront pas enregistrés.';

function confirmDiscard(onDiscard: () => void) {
  // react-native-web's Alert is a no-op.
  if (Platform.OS === 'web') {
    if (window.confirm(`${DISCARD_TITLE}\n${DISCARD_MESSAGE}`)) onDiscard();
    return;
  }
  Alert.alert(DISCARD_TITLE, DISCARD_MESSAGE, [
    { text: 'Continuer', style: 'cancel' },
    { text: 'Abandonner', style: 'destructive', onPress: onDiscard },
  ]);
}

/**
 * Manual edit of the itinerary: a local draft (reorder, move to another day, remove) saved in one
 * go with `discovery.updatePlanning`. Leaving with unsaved changes asks first.
 */
export function usePlanningDraft(tripId: string, itinerary: TripDay[]) {
  const queryClient = useQueryClient();
  /** `null` outside edit mode. */
  const [draft, setDraft] = useState<TripDay[] | null>(null);
  /** Place whose "Déplacer vers…" sheet is open. */
  const [moving, setMoving] = useState<{ dayId: string; activityId: string } | null>(null);

  const mutation = useMutation(
    trpc.discovery.updatePlanning.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: trpc.user.getTrips.queryKey() });
        // Awaited so the page does not flash the old order between the draft and the new data.
        await queryClient.invalidateQueries({
          queryKey: trpc.discovery.getTrip.queryKey({ tripId }),
        });
        setDraft(null);
      },
    }),
  );

  const isDirty = draft !== null && isDraftDirty(draft, itinerary);

  // Covers Android's back button and the iOS back gesture.
  // Router 58: drop the draft (prevention off), then `repeat` replays the blocked action.
  usePreventRemove(isDirty && !mutation.isPending, ({ repeat }) =>
    confirmDiscard(() => {
      setDraft(null);
      repeat();
    }),
  );

  const update = (edit: (days: TripDay[]) => TripDay[]) => setDraft((d) => d && edit(d));

  return {
    draft,
    isEditing: draft !== null,
    start: () => {
      mutation.reset();
      setDraft(toDraft(itinerary));
    },
    cancel: () => {
      if (isDirty) confirmDiscard(() => setDraft(null));
      else setDraft(null);
    },
    save: () => draft && mutation.mutate(toPlanningInput(tripId, draft)),
    isSaving: mutation.isPending,
    errorMessage: mutation.isError
      ? mutation.error.message || 'Impossible d’enregistrer le planning.'
      : null,
    /** Edit callbacks for one day of the draft. */
    editDay: (dayId: string) => ({
      moveUp: (activityId: string) => update((d) => moveWithinDay(d, dayId, activityId, -1)),
      moveDown: (activityId: string) => update((d) => moveWithinDay(d, dayId, activityId, 1)),
      openMoveToDay: (activityId: string) => setMoving({ dayId, activityId }),
      remove: (activityId: string) => update((d) => removeFromDay(d, dayId, activityId)),
    }),
    /** Days the place being moved can go to; `null` while no move is open. */
    moveTargets: draft && moving ? draft.filter((day) => day.id !== moving.dayId) : null,
    closeMoveToDay: () => setMoving(null),
    moveTo: (targetDayId: string) => {
      if (moving) update((d) => moveToDay(d, moving.dayId, moving.activityId, targetDayId));
      setMoving(null);
    },
  };
}

export type PlanningDraft = ReturnType<typeof usePlanningDraft>;
export type DayEdit = ReturnType<PlanningDraft['editDay']>;
