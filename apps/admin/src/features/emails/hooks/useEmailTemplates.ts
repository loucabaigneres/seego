import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

/** Resend templates, the test send and the "template → draft broadcast" mutation. */
export function useEmailTemplates() {
  const queryClient = useQueryClient();
  const query = useQuery(trpc.admin.email.templates.queryOptions());

  const sendTest = useMutation(trpc.admin.email.sendTest.mutationOptions());
  const createBroadcast = useMutation(
    trpc.admin.email.createBroadcast.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: trpc.admin.email.broadcasts.queryKey() }),
    }),
  );

  return { query, sendTest, createBroadcast };
}

export type CreateBroadcastMutation = ReturnType<typeof useEmailTemplates>['createBroadcast'];
