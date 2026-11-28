import { useQuery } from '@tanstack/react-query';

import { splitTripDays, tripCoverImage } from '@/domain/trip';
import { tripDisplayTitle } from '@/domain/trip-summary';
import { useAuthSession } from '@/hooks/useAuthSession';
import { trpc } from '@/lib/trpc';

import { waitingMembers } from '../lib/invite';

/** The trip just joined: its title and photo, and the members who were already in. */
export function useJoinWelcome(tripId: string) {
  const { user } = useAuthSession();
  const trip = useQuery(trpc.discovery.getTrip.queryOptions({ tripId }));
  const members = useQuery(trpc.group.getGroupMembers.queryOptions({ tripId }));

  const days = splitTripDays(trip.data?.days ?? []);
  // Owner first, as everywhere else in the group screens.
  const name = (member: { name: string; email: string }) => member.name || member.email;
  const list = members.data ?? [];
  const others = list
    .filter((member) => member.id !== user?.id)
    .sort((a, b) => Number(b.role === 'owner') - Number(a.role === 'owner'))
    .map(name);
  const me = list.filter((member) => member.id === user?.id).map(name);

  return {
    isLoading: trip.isPending || members.isPending,
    failed: trip.isError || members.isError,
    retry: () => Promise.all([trip.refetch(), members.refetch()]),
    title: trip.data ? tripDisplayTitle(trip.data.trip) : null,
    destination: trip.data?.trip.destination?.trim() || null,
    coverImage: tripCoverImage(days.itinerary, days.likedPlaces),
    /** The others, then the user who just joined, drawn last. */
    memberNames: [...others, ...me],
    waiting: waitingMembers(others),
  };
}
