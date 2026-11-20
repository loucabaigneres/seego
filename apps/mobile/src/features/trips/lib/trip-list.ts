import { pluralize } from '@/domain/date';

/** "5 voyages · dont 2 groupés" above the Trips title. */
export function tripsOverline(trips: readonly { groupRole: string | null }[]): string {
  const groupCount = trips.filter((trip) => trip.groupRole).length;
  const total = pluralize(trips.length, 'voyage');
  return groupCount > 0 ? `${total} · dont ${pluralize(groupCount, 'groupé')}` : total;
}

/** "Li" for Lisbonne: the two letters printed on a trip's tile, from its destination else title. */
export function tripMonogram(trip: { title: string | null; destination: string | null }): string {
  const source = trip.destination?.trim() || trip.title?.trim() || '';
  // `Array.from` splits by code point, so an accented first letter stays whole.
  const [first = '', second = ''] = Array.from(source);
  return first.toLocaleUpperCase('fr-FR') + second.toLocaleLowerCase('fr-FR');
}
