import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Share } from 'react-native';

import { tripDisplayTitle } from '@/domain/trip-summary';
import { WEB_URL } from '@/env';
import { useAuthSession } from '@/hooks/useAuthSession';
import { trpc, type RouterOutputs } from '@/lib/trpc';
import { confirmDestructive } from '@/ui/confirm';

import { groupCardState, inviteStatus, inviteUrl } from '../lib/invite';

type Trip = RouterOutputs['discovery']['getTrip']['trip'];
export type GroupMember = RouterOutputs['group']['getGroupMembers'][number];

/**
 * The group side of a trip page: turning the trip into a group, sharing its invite, and the
 * "Voyage de groupe" sheet (destination, members, new code, leaving or deleting the group).
 */
export function useGroupTrip(tripId: string, trip: Trip | null) {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  /** `null` until the destination field is edited. */
  const [destinationDraft, setDestinationDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state = trip ? groupCardState(trip, user?.id) : 'hidden';
  const isHost = !!user && trip?.userId === user.id;
  const code = trip?.inviteCode ?? null;
  const membersKey = trpc.group.getGroupMembers.queryKey({ tripId });

  const refreshTrip = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.discovery.getTrip.queryKey({ tripId }) }),
      queryClient.invalidateQueries({ queryKey: trpc.group.pathKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.user.pathKey() }),
    ]);

  /** Out of the trip once the user no longer belongs to it. */
  const exitTrip = (deleted: boolean) => {
    setIsOpen(false);
    router.replace('/trips');
    if (deleted)
      queryClient.removeQueries({ queryKey: trpc.discovery.getTrip.queryKey({ tripId }) });
    void queryClient.invalidateQueries({ queryKey: trpc.group.pathKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.user.pathKey() });
  };

  const fail = (message: string) => () => setError(message);

  const convert = useMutation(
    trpc.group.createOrConvertGroupTrip.mutationOptions({ onSuccess: refreshTrip }),
  );
  const regenerate = useMutation(
    trpc.group.regenerateInviteCode.mutationOptions({
      onSuccess: refreshTrip,
      onError: fail('Impossible de générer un nouveau code. Réessaie.'),
    }),
  );
  const updateDestination = useMutation(
    trpc.group.updateDestination.mutationOptions({
      onSuccess: async () => {
        await refreshTrip();
        setDestinationDraft(null);
      },
      onError: fail('Impossible de changer la destination. Réessaie.'),
    }),
  );
  const removeMember = useMutation(
    trpc.group.removeMember.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
      onError: fail('Impossible de retirer ce membre. Réessaie.'),
    }),
  );
  const leave = useMutation(
    trpc.group.leaveGroupTrip.mutationOptions({
      onSuccess: () => exitTrip(false),
      onError: fail('Impossible de quitter ce voyage. Réessaie.'),
    }),
  );
  const deleteTrip = useMutation(
    trpc.group.deleteGroupTrip.mutationOptions({
      onSuccess: () => exitTrip(true),
      onError: fail('Impossible de supprimer ce voyage. Réessaie.'),
    }),
  );

  const members = useQuery({
    ...trpc.group.getGroupMembers.queryOptions({ tripId }),
    enabled: isOpen && state === 'active',
  });

  const destination = destinationDraft ?? trip?.destination ?? '';
  const title = trip ? tripDisplayTitle(trip) : '';

  return {
    state,
    isHost,
    code,
    status: inviteStatus(trip?.inviteCodeExpiresAt),
    signIn: () => router.push('/auth/sign-in'),
    convert: {
      run: () => convert.mutate({ tripId, destination: trip?.destination ?? undefined }),
      isPending: convert.isPending,
      failed: convert.isError,
    },
    share: () => {
      if (!code) return;
      void Share.share({
        message: `Rejoins « ${title} » sur Seego : ${inviteUrl(WEB_URL, code)} (code ${code}, valable 24 h)`,
      });
    },
    regenerate: {
      run: () => regenerate.mutate({ tripId }),
      isPending: regenerate.isPending,
    },
    sheet: {
      isOpen,
      open: () => {
        setError(null);
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
      error,
    },
    members: {
      list: members.data ?? [],
      isLoading: members.isPending,
      failed: members.isError,
      retry: () => members.refetch(),
      removingId: removeMember.isPending ? removeMember.variables?.userId : undefined,
      remove: (member: GroupMember) =>
        confirmDestructive({
          title: 'Retirer ce membre ?',
          message: `${member.name || member.email} n’aura plus accès à ce voyage.`,
          confirmLabel: 'Retirer',
          onConfirm: () => {
            setError(null);
            removeMember.mutate({ tripId, userId: member.id });
          },
        }),
    },
    destination: {
      value: destination,
      setValue: (next: string) => {
        setDestinationDraft(next);
        setError(null);
      },
      canSave: destination.trim() !== '' && destination.trim() !== (trip?.destination ?? ''),
      save: () => updateDestination.mutate({ tripId, destination: destination.trim() }),
      isSaving: updateDestination.isPending,
    },
    leave: {
      run: () =>
        confirmDestructive({
          title: 'Quitter ce voyage ?',
          message: `Tu n’auras plus accès à « ${title} ». Il te faudra une nouvelle invitation pour revenir.`,
          confirmLabel: 'Quitter',
          onConfirm: () => {
            setError(null);
            leave.mutate({ tripId });
          },
        }),
      isPending: leave.isPending,
    },
    deleteTrip: {
      run: () =>
        confirmDestructive({
          title: 'Supprimer ce voyage de groupe ?',
          message: `« ${title} », son itinéraire et l’accès de tous les membres seront supprimés définitivement.`,
          confirmLabel: 'Supprimer',
          onConfirm: () => {
            setError(null);
            deleteTrip.mutate({ tripId });
          },
        }),
      isPending: deleteTrip.isPending,
    },
  };
}
