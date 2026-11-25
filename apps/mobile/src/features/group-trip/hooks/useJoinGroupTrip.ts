import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { trpc } from '@/lib/trpc';

import { isCodeRejected } from '../lib/invite';

/**
 * Joins a group trip with its invite code, then shows the welcome screen (not the swipe deck: a
 * member's swipes would overwrite the host's liked places). An unknown or expired code goes back
 * to the code screen, which explains it.
 */
export function useJoinGroupTrip() {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.group.joinGroupTrip.mutationOptions({
      onSuccess: ({ tripId }) => {
        void queryClient.invalidateQueries({ queryKey: trpc.group.pathKey() });
        void queryClient.invalidateQueries({
          queryKey: trpc.discovery.getTrip.queryKey({ tripId }),
        });
        router.replace({ pathname: '/trip/[tripId]/welcome', params: { tripId } });
      },
      onError: (error, { inviteCode }) => {
        const code = error.data?.code;
        if (isCodeRejected(code))
          router.replace({ pathname: '/join', params: { code: inviteCode, error: code } });
      },
    }),
  );

  return {
    join: (inviteCode: string) => mutation.mutate({ inviteCode }),
    isJoining: mutation.isPending,
    // Only a network or server failure stays here: the button can be pressed again.
    failed: mutation.isError && !isCodeRejected(mutation.error.data?.code),
  };
}
