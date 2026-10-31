import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc';
import type { TripFormValues } from '../lib/tripForm';

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
  });

  const submitTripMutation = useMutation(trpc.submitTripConfiguration.mutationOptions());
  const generateMutation = useMutation(trpc.discovery.generateItinerary.mutationOptions());

  const submit = async (data: TripFormValues) => {
    const finalDietary = [...data.dietaryOptions, data.dietaryCustom].filter(Boolean).join(', ');
    const finalMedical = [...data.medicalOptions, data.medicalCustom].filter(Boolean).join(', ');

    try {
      const result = await submitTripMutation.mutateAsync({
        ...data,
        ages: data.ages.map((a) => a.value),
        dietaryRestrictions: finalDietary,
        medicalConditions: finalMedical,
        tripId,
      });
      await generateMutation.mutateAsync({ tripId: result.tripId });
      navigate({ to: '/trip/$tripId', params: { tripId: result.tripId } });
    } catch (error) {
      console.error('❌ Erreur lors de la création du voyage :', error);
      alert('Une erreur est survenue, regarde la console.');
    }
  };

  return {
    isLoadingTrip: !!tripId && existingTripQuery.isPending,
    initialDestination: existingTripQuery.data?.destination ?? 'Paris',
    isSubmitting: submitTripMutation.isPending || generateMutation.isPending,
    submit,
  };
}
