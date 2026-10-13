import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../lib/trpc';

interface UseGroupTripMutationsOptions {
  onCreated?: (data: { tripId: string; inviteCode: string }) => void;
  onCodeRegenerated?: (data: { inviteCode: string }) => void;
  onJoined?: (data: { tripId: string }) => void;
  onJoinError?: (message: string) => void;
  onMemberRemoved?: () => void;
  onTripDeleted?: () => void;
}

/**
 * Regroupe les mutations tRPC liées aux voyages de groupe (création/conversion,
 * régénération du code, rejoindre, retirer un membre, supprimer) ainsi que
 * l'invalidation du cache associée. Les effets de bord purement UI (état local)
 * restent à la charge du composant via les callbacks.
 */
export function useGroupTripMutations(options: UseGroupTripMutationsOptions = {}) {
  const queryClient = useQueryClient();

  const invalidateTrips = () => {
    queryClient.invalidateQueries({ queryKey: trpc.group.getMyGroupTrips.queryKey() });
    queryClient.invalidateQueries(trpc.discovery.getTrip.queryFilter());
  };

  const createOrConvert = useMutation(
    trpc.group.createOrConvertGroupTrip.mutationOptions({
      onSuccess: (data) => {
        invalidateTrips();
        if (data.inviteCode !== null) {
          options.onCreated?.({ tripId: data.tripId, inviteCode: data.inviteCode });
        }
      },
    }),
  );

  const regenerateCode = useMutation(
    trpc.group.regenerateInviteCode.mutationOptions({
      onSuccess: (data) => {
        invalidateTrips();
        if (data.inviteCode !== null) {
          options.onCodeRegenerated?.({ inviteCode: data.inviteCode });
        }
      },
    }),
  );

  const joinWithCode = useMutation(
    trpc.group.joinGroupTrip.mutationOptions({
      onSuccess: (data) => {
        invalidateTrips();
        options.onJoined?.(data);
      },
      onError: (err) => options.onJoinError?.(err.message),
    }),
  );

  const removeMember = useMutation(
    trpc.group.removeMember.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.group.getGroupMembers.queryKey({ tripId: variables.tripId }),
        });
        options.onMemberRemoved?.();
      },
    }),
  );

  const deleteTrip = useMutation(
    trpc.group.deleteGroupTrip.mutationOptions({
      onSuccess: () => {
        invalidateTrips();
        options.onTripDeleted?.();
      },
    }),
  );

  return {
    createOrConvert: createOrConvert.mutate,
    isCreating: createOrConvert.isPending,
    regenerateCode: regenerateCode.mutate,
    isRegenerating: regenerateCode.isPending,
    joinWithCode: joinWithCode.mutate,
    isJoining: joinWithCode.isPending,
    removeMember: removeMember.mutate,
    isRemovingMember: removeMember.isPending,
    deleteTrip: deleteTrip.mutate,
    isDeletingTrip: deleteTrip.isPending,
  };
}
