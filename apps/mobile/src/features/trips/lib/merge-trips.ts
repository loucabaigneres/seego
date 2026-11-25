import type { RouterOutputs } from '@/lib/trpc';

type OwnedTrip = RouterOutputs['user']['getTrips'][number];
type GroupTrip = RouterOutputs['group']['getMyGroupTrips'][number];

export type TripListItem = OwnedTrip & { groupRole: GroupTrip['role'] | null };

/**
 * The Trips tab: the user's own trips and the group trips they joined, newest first. A group
 * trip the user hosts comes back from both lists and is shown once.
 */
export function mergeTrips(owned: OwnedTrip[], groups: GroupTrip[]): TripListItem[] {
  const roles = new Map(groups.map((trip) => [trip.id, trip.role]));
  const ownedIds = new Set(owned.map((trip) => trip.id));
  const joined = groups
    .filter((trip) => !ownedIds.has(trip.id))
    .map(({ id, title, destination, status, createdAt, role }) => ({
      id,
      title,
      destination,
      status,
      createdAt,
      // Not sent for a joined trip: its delete sheet and stats are never shown.
      startDate: null,
      durationDays: null,
      daysCount: 0,
      stepsCount: 0,
      likedCount: 0,
      coverImage: null,
      groupRole: role,
    }));

  return [
    ...owned.map((trip) => ({ ...trip, groupRole: roles.get(trip.id) ?? null })),
    ...joined,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
