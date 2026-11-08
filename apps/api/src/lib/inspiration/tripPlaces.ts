import type { ExtractedPlace } from '@seego/database';
import { and, eq, max } from 'drizzle-orm';
import type { Context } from '../../trpc/context.js';
import type { ImportedPlaceRef } from '../importedPlaces.js';
import { activity, tripDay } from '../tables.js';
import { placeLocation } from './places.js';

// Les lieux importés rejoignent le bucket « lieux likés » du voyage (jour 0), celui qui
// s'affiche avant génération et qui alimente la génération de l'itinéraire.
const LIKED_DAY_INDEX = 0;

export interface PlaceWithRef {
  place: ExtractedPlace;
  ref: ImportedPlaceRef | null;
}

/** Ajoute une activité par lieu à la suite du bucket « lieux likés » (créé si besoin). */
export async function addPlacesToLikedDay(
  db: Context['db'],
  tripId: string,
  places: PlaceWithRef[],
): Promise<number> {
  return db.transaction(async (tx) => {
    // Le bucket « lieux likés » (jour 0) peut ne pas exister encore.
    let [likedDay] = await tx
      .select({ id: tripDay.id })
      .from(tripDay)
      .where(and(eq(tripDay.tripId, tripId), eq(tripDay.dayIndex, LIKED_DAY_INDEX)));

    if (!likedDay) {
      [likedDay] = await tx
        .insert(tripDay)
        .values({ tripId, dayIndex: LIKED_DAY_INDEX, summary: 'Lieux likés' })
        .returning({ id: tripDay.id });
    }

    // On ajoute à la suite des activités déjà présentes dans le bucket.
    const [{ maxOrder } = { maxOrder: null }] = await tx
      .select({ maxOrder: max(activity.orderIndex) })
      .from(activity)
      .where(eq(activity.tripDayId, likedDay.id));

    const startIndex = (maxOrder ?? -1) + 1;

    await tx.insert(activity).values(
      places.map(({ place, ref }, i) => ({
        tripDayId: likedDay.id,
        discoveryContentId: ref?.id ?? undefined,
        title: place.name,
        description: place.description ?? undefined,
        locationName: placeLocation(place) ?? undefined,
        // Coordonnées géocodées : le lieu apparaît ainsi sur la carte du voyage.
        coordinates: ref?.coordinates ?? undefined,
        orderIndex: startIndex + i,
      })),
    );

    return places.length;
  });
}
