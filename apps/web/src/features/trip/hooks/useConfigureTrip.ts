import { track } from '@/lib/analytics';
import { trpc } from '@/lib/trpc';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { TripFormValues } from '../lib/tripForm';
import { tripDurationDays, tripToFormValues } from '../lib/tripForm';

/** Duration of the progress bar's fill animation (see ProgressBar). */
const PROGRESS_FILL_MS = 600;

/**
 * Trip configuration form: saves the answers, generates the itinerary, then opens the trip.
 * When `tripId` is given (arriving from the swipe flow) the existing trip is loaded to prefill
 * the form and updated instead of forking a new one.
 */
export function useConfigureTrip(tripId: string | undefined) {
  const navigate = useNavigate();

  const existingTripQuery = useQuery({
    ...trpc.getTripConfiguration.queryOptions({ tripId: tripId! }),
    enabled: !!tripId,
    // Always read the saved answers fresh: they change every time the form is submitted.
    gcTime: 0,
    refetchOnMount: 'always',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTripMutation = useMutation(trpc.submitTripConfiguration.mutationOptions());
  const generateMutation = useMutation(trpc.discovery.generateItinerary.mutationOptions());

  const submit = async (data: TripFormValues) => {
    const { endDate, ...fields } = data;
    const finalDietary = [...data.dietaryOptions, data.dietaryCustom].filter(Boolean).join(', ');
    const finalMedical = [...data.medicalOptions, data.medicalCustom].filter(Boolean).join(', ');

    setIsSubmitting(true);
    // Keeps the form's progress bar on screen long enough to visibly reach 100 %.
    const barFilled = new Promise((resolve) => setTimeout(resolve, PROGRESS_FILL_MS));

    try {
      const result = await submitTripMutation.mutateAsync({
        ...fields,
        durationDays: tripDurationDays(data.startDate, endDate),
        ages: data.ages.map((a) => a.value),
        dietaryRestrictions: finalDietary,
        medicalConditions: finalMedical,
        tripId,
      });
      await generateMutation.mutateAsync({ tripId: result.tripId });
      track('trip_configured', {
        duration_days: tripDurationDays(data.startDate, endDate),
        travelers: data.ages.length,
        is_new_trip: !tripId,
      });
      await barFilled;
      navigate({ to: '/trip/$tripId', params: { tripId: result.tripId } });
    } catch (error) {
      track('trip_configuration_failed', {
        message: error instanceof Error ? error.message : 'unknown',
      });
      console.error('❌ Erreur lors de la création du voyage :', error);
      alert('Une erreur est survenue, regarde la console.');
      setIsSubmitting(false);
    }
  };

  return {
    isLoadingTrip: !!tripId && existingTripQuery.isPending,
    initialValues: existingTripQuery.data ? tripToFormValues(existingTripQuery.data) : undefined,
    isSubmitting,
    submit,
  };
}
