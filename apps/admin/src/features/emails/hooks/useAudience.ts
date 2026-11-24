import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isImportRunning } from '@/features/emails/lib/labels';
import { trpc } from '@/lib/trpc';

/** Newsletter audience (DB vs Resend segment) and the full-sync mutation. */
export function useAudience() {
  const queryClient = useQueryClient();
  const overview = useQuery({
    ...trpc.admin.email.overview.queryOptions(),
    // While a contact import runs on Resend, poll until it settles.
    refetchInterval: (query) =>
      isImportRunning(query.state.data?.lastImport?.status) ? 3000 : false,
  });

  const sync = useMutation(
    trpc.admin.email.sync.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: trpc.admin.email.overview.queryKey() }),
    }),
  );

  return { overview, sync };
}
