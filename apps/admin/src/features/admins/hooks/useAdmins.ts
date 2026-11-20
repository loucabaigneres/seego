import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

/** Current admins + audit trail, and the role mutations that refresh them. */
export function useAdmins() {
  const queryClient = useQueryClient();
  const query = useQuery(trpc.admin.admins.list.queryOptions());
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: trpc.admin.admins.list.queryKey() });

  const grant = useMutation(trpc.admin.admins.grant.mutationOptions({ onSuccess: refresh }));
  const revoke = useMutation(trpc.admin.admins.revoke.mutationOptions({ onSuccess: refresh }));

  return { query, grant, revoke };
}

export type GrantMutation = ReturnType<typeof useAdmins>['grant'];
export type RevokeMutation = ReturnType<typeof useAdmins>['revoke'];
