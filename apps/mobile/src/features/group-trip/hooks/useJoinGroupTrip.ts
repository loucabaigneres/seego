import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { trpc } from '@/lib/trpc';

import { joinErrorMessage } from '../lib/invite';

/**
 * Joins a group trip with its invite code, then opens the trip page (not the swipe deck: a
 * member's swipes would overwrite the host's liked places). `replace` drops the invite screen.
 */
export function useJoinGroupTrip({ replace = false }: { replace?: boolean } = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.group.joinGroupTrip.mutationOptions({
      onSuccess: ({ tripId }) => {
        void queryClient.invalidateQueries({ queryKey: trpc.group.pathKey() });
        void queryClient.invalidateQueries({
          queryKey: trpc.discovery.getTrip.queryKey({ tripId }),
        });
        const href = { pathname: '/trip/[tripId]', params: { tripId } } as const;
        if (replace) router.replace(href);
        else router.push(href);
      },
    }),
  );

  return {
    join: (inviteCode: string) => mutation.mutate({ inviteCode }),
    isJoining: mutation.isPending,
    error: mutation.isError ? joinErrorMessage(mutation.error.data?.code) : null,
    reset: mutation.reset,
  };
}
