import type { RouterOutputs } from '@/lib/trpc';

type OwnedTrip = RouterOutputs['user']['getTrips'][number];
type GroupTrip = RouterOutputs['group']['getMyGroupTrips'][number];

type GroupSummary = Pick<GroupTrip, 'memberCount' | 'members' | 'ownerName'>;

export type TripListItem = OwnedTrip & {
  groupRole: GroupTrip['role'] | null;
  /** Who is in the group; null for a solo trip. */
  group: GroupSummary | null;
};

function summary({ memberCount, members, ownerName }: GroupTrip): GroupSummary {
  return { memberCount, members, ownerName };
}

/**
 * The Trips tab: the user's own trips and the group trips they joined, newest first. A group
 * trip the user hosts comes back from both lists and is shown once.
 */
export function mergeTrips(owned: OwnedTrip[], groups: GroupTrip[]): TripListItem[] {
  const byId = new Map(groups.map((trip) => [trip.id, trip]));
  const ownedIds = new Set(owned.map((trip) => trip.id));
  const joined = groups
    .filter((trip) => !ownedIds.has(trip.id))
    .map((trip) => {
      const { id, title, destination, status, createdAt, role } = trip;
      return {
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
        group: summary(trip),
      };
    });

  return [
    ...owned.map((trip) => {
      const group = byId.get(trip.id);
      return { ...trip, groupRole: group?.role ?? null, group: group ? summary(group) : null };
    }),
    ...joined,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
