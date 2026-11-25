import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
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
 * The group side of a trip: turning it into a group, its invite (share, copy, new code), its
 * destination, its members, leaving or deleting it. Shared by the trip page and the participants
 * screen.
 */
export function useGroupTrip(tripId: string, trip: Trip | null) {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const [isCopied, setIsCopied] = useState(false);
  /** The member the remove sheet asks about (and their place in the list, for the avatar). */
  const [removing, setRemoving] = useState<{ member: GroupMember; index: number } | null>(null);
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
      onSuccess: () => {
        setRemoving(null);
        return queryClient.invalidateQueries({ queryKey: membersKey });
      },
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
    // Avatars and counts show on the trip page, not only on the participants screen.
    enabled: state === 'active',
  });

  const destination = destinationDraft ?? trip?.destination ?? '';
  const title = trip ? tripDisplayTitle(trip) : '';

  return {
    state,
    isHost,
    meId: user?.id,
    code,
    status: inviteStatus(trip?.inviteCodeExpiresAt),
    signIn: () => router.push('/auth/sign-in'),
    openParticipants: () =>
      router.push({ pathname: '/trip/[tripId]/participants', params: { tripId } }),
    copy: {
      run: () => {
        if (!code) return;
        void Clipboard.setStringAsync(code).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        });
      },
      isCopied,
    },
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
    error,
    members: {
      list: members.data ?? [],
      isLoading: members.isPending,
      failed: members.isError,
      retry: () => members.refetch(),
      removingId: removeMember.isPending ? removeMember.variables?.userId : undefined,
      removal: {
        pending: removing,
        open: (member: GroupMember, index: number) => {
          removeMember.reset();
          setRemoving({ member, index });
        },
        close: () => setRemoving(null),
        confirm: () => removing && removeMember.mutate({ tripId, userId: removing.member.id }),
        isRemoving: removeMember.isPending,
        failed: removeMember.isError,
      },
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

/** A group trip loaded on its own, for the screens outside the trip page (participants). */
export function useGroupTripById(tripId: string) {
  const query = useQuery(trpc.discovery.getTrip.queryOptions({ tripId }));
  const trip = query.data?.trip ?? null;
  const group = useGroupTrip(tripId, trip);
  return {
    trip,
    isLoading: query.isPending,
    failed: query.isError,
    retry: () => query.refetch(),
    group,
  };
}
