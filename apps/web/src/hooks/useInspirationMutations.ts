import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc, type RouterOutputs } from '../lib/trpc';

type AddToTripResult = RouterOutputs['inspiration']['addToTrip'];

interface UseInspirationMutationsOptions {
  /** Appelé après un ajout réussi (le cache du voyage est déjà invalidé). */
  onAddedToTrip?: (data: AddToTripResult) => void;
  /** Appelé après une suppression réussie (la liste est déjà invalidée). */
  onDeleted?: () => void;
}

/**
 * Regroupe les mutations d'inspiration (ajout au voyage, suppression) et leur
 * invalidation de cache, pour que les composants ne portent que l'UI. Les callbacks
 * laissent chaque composant réagir à sa façon (bannière, reset de sélection…).
 */
export function useInspirationMutations({
  onAddedToTrip,
  onDeleted,
}: UseInspirationMutationsOptions = {}) {
  const queryClient = useQueryClient();

  const addToTrip = useMutation(
    trpc.inspiration.addToTrip.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.discovery.getTrip.queryFilter({ tripId: data.tripId }));
        onAddedToTrip?.(data);
      },
    }),
  );

  const remove = useMutation(
    trpc.inspiration.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.inspiration.listMine.queryFilter());
        onDeleted?.();
      },
    }),
  );

  return { addToTrip, remove };
}
