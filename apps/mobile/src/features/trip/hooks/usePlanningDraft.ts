import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePreventRemove } from 'expo-router';
import { useState } from 'react';

import { trpc } from '@/lib/trpc';
import { confirmDestructive } from '@/ui/confirm';

import {
  isDraftDirty,
  moveToDay,
  moveWithinDay,
  removeFromDay,
  toDraft,
  toPlanningInput,
} from '../lib/planning-edits';
import type { TripDay } from './useTrip';

function confirmDiscard(onDiscard: () => void) {
  confirmDestructive({
    title: 'Abandonner les modifications ?',
    message: 'Tes changements du planning ne seront pas enregistrés.',
    confirmLabel: 'Abandonner',
    cancelLabel: 'Continuer',
    onConfirm: onDiscard,
  });
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
