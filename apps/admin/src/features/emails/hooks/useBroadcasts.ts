import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

/** Resend broadcasts and the send / delete mutations that refresh them. */
export function useBroadcasts() {
  const queryClient = useQueryClient();
  const query = useQuery(trpc.admin.email.broadcasts.queryOptions());
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: trpc.admin.email.broadcasts.queryKey() });

  const send = useMutation(trpc.admin.email.sendBroadcast.mutationOptions({ onSuccess: refresh }));
  const remove = useMutation(
    trpc.admin.email.removeBroadcast.mutationOptions({ onSuccess: refresh }),
  );

  return { query, send, remove };
}

export type SendBroadcastMutation = ReturnType<typeof useBroadcasts>['send'];
export type RemoveBroadcastMutation = ReturnType<typeof useBroadcasts>['remove'];
