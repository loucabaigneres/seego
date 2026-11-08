import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useReducer } from 'react';

import { useHardwareBack } from '@/hooks/useHardwareBack';
import { trpc } from '@/lib/trpc';

import {
  currentStep,
  initialTripConfigState,
  isLastStep,
  toSubmitInput,
  TRIP_CONFIG_STEPS,
  tripConfigProgress,
  tripConfigReducer,
} from '../lib/trip-config';

/** The 3-step form of a trip from the swipe flow, then its itinerary generation. */
export function useTripConfig(tripId: string) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(tripConfigReducer, initialTripConfigState);

  // Only the destination is read: it is the one field the swipe flow fills in.
  const configuration = useQuery(trpc.getTripConfiguration.queryOptions({ tripId }));
  const destination = configuration.data?.destination ?? null;

  const generation = useMutation(
    trpc.discovery.generateItinerary.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.user.getTrips.queryKey() });
        queryClient.invalidateQueries({
          queryKey: trpc.discovery.getTrip.queryKey({ tripId: data.tripId }),
        });
        // Push, not replace: going back reopens the form to adjust it and generate again.
        router.push({ pathname: '/trip/[tripId]', params: { tripId: data.tripId } });
      },
    }),
  );

  const submission = useMutation(
    trpc.submitTripConfiguration.mutationOptions({
      onSuccess: (data) => generation.mutate({ tripId: data.tripId }),
    }),
  );

  const isSubmitting = submission.isPending || generation.isPending;
  const isFirstStep = state.stepIndex === 0;

  const goBack = () => {
    if (isSubmitting) return;
    if (isFirstStep) router.back();
    else dispatch({ type: 'back' });
  };

  // Android's back button walks the steps backwards, and waits while the trip is generated.
  useHardwareBack(() => {
    if (isSubmitting) return true;
    if (isFirstStep) return false;
    dispatch({ type: 'back' });
    return true;
  });

  const goForward = () => {
    if (!isLastStep(state)) {
      dispatch({ type: 'next' });
      return;
    }
    const input = destination && toSubmitInput(state.values, { tripId, destination });
    if (!input) return;
    generation.reset();
    submission.mutate(input);
  };

  return {
    destination,
    isLoading: configuration.isPending,
    loadFailed: configuration.isError,
    retryLoad: () => configuration.refetch(),
    step: {
      key: currentStep(state),
      current: state.stepIndex + 1,
      total: TRIP_CONFIG_STEPS.length,
      progress: tripConfigProgress(state),
    },
    values: state.values,
    errors: state.errors,
    dispatch,
    isLastStep: isLastStep(state),
    goBack,
    goForward,
    isSubmitting,
    hasFailed: submission.isError || generation.isError,
  };
}

export type TripConfig = ReturnType<typeof useTripConfig>;
