import { track } from '@/lib/analytics';
import { trpc } from '@/lib/trpc';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

/** Joins a group trip from an invite link, then opens its swipe deck. */
export function useJoinGroupTrip() {
  const navigate = useNavigate();

  const mutation = useMutation(
    trpc.group.joinGroupTrip.mutationOptions({
      onSuccess: (data) => {
        track('group_trip_joined', { method: 'link' });
        navigate({ href: `/discovery?tripId=${data.tripId}` });
      },
      onError: (err) => {
        track('group_trip_join_failed', { method: 'link', message: err.message });
      },
    }),
  );

  return {
    join: (inviteCode: string) => mutation.mutate({ inviteCode }),
    isJoining: mutation.isPending,
    error: mutation.error,
  };
}
