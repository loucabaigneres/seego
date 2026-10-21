import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc';

/** Joins a group trip from an invite link, then opens its swipe deck. */
export function useJoinGroupTrip() {
  const navigate = useNavigate();

  const mutation = useMutation(
    trpc.group.joinGroupTrip.mutationOptions({
      onSuccess: (data) => {
        navigate({ href: `/discovery?tripId=${data.tripId}` });
      },
    }),
  );

  return {
    join: (inviteCode: string) => mutation.mutate({ inviteCode }),
    isJoining: mutation.isPending,
    error: mutation.error,
  };
}
