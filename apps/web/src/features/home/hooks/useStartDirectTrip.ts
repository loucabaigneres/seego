import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useGuestId } from '@/hooks/useGuestId';
import { trpc } from '@/lib/trpc';

/** "Surprends-moi": creates an empty trip for the guest, then opens the swipe deck. */
export function useStartDirectTrip() {
  const navigate = useNavigate();
  const guestId = useGuestId();

  const mutation = useMutation(
    trpc.onboarding.startDirectTrip.mutationOptions({
      onSuccess: (data) => {
        navigate({
          to: '/discovery',
          search: { tripId: data.tripId },
        });
      },
    }),
  );

  return {
    start: () => mutation.mutate({ guestId }),
    isStarting: mutation.isPending,
  };
}
