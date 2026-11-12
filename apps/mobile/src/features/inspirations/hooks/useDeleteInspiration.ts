import { useMutation, useQueryClient } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc';
import { confirmDestructive } from '@/ui/confirm';

/** Deletes one of the user's inspirations, after a confirmation. */
export function useDeleteInspiration() {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.inspiration.delete.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: trpc.inspiration.listMine.queryKey() }),
    }),
  );

  return {
    remove: (id: string) =>
      confirmDestructive({
        title: 'Supprimer cette inspiration ?',
        message: 'Les lieux déjà ajoutés à tes voyages sont conservés.',
        confirmLabel: 'Supprimer',
        onConfirm: () => mutation.mutate({ id }),
      }),
    deletingId: mutation.isPending ? mutation.variables?.id : undefined,
    failed: mutation.isError,
  };
}
