import { pluralize } from '@/domain/date';

/** "5 voyages · dont 2 groupés" above the Trips title. */
export function tripsOverline(trips: readonly { groupRole: string | null }[]): string {
  const groupCount = trips.filter((trip) => trip.groupRole).length;
  const total = pluralize(trips.length, 'voyage');
  return groupCount > 0 ? `${total} · dont ${pluralize(groupCount, 'groupé')}` : total;
}
