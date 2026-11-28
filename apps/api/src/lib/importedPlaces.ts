/**
 * Lieux importés depuis les inspirations, stockés dans le catalogue (`places` +
 * `place_details`), rattachés à un utilisateur (`ownerUserId`) et `isActive=false` :
 * invisibles du feed de découverte et de la génération, ils ne servent qu'au remplacement
 * d'activités. L'app les relit par la vue `discovery_content`.
 *
 * Déduplication : un lieu a une URL synthétique stable `imported:<userId>:<clé>`, où la
 * clé est normalisée (nom + ville). Réanalyser la même vidéo, ou une autre vidéo sur le
 * même lieu, retombe sur la même ligne — on enrichit alors sa description au lieu d'en
 * créer une seconde.
 */

import {
  appendDescription,
  ensureCity,
  type ExtractedPlace,
  type PlaceCategory,
  type PlaceDetailsData,
  toCatalogueCategory,
} from '@seego/database';
import { eq, sql } from 'drizzle-orm';
import type { Context } from '../trpc/context.js';
import { geocodeAddress, toWktPoint } from './geocoding.js';
import { placeDetails, places } from './tables.js';

const stripDiacritics = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
const slug = (value: string) =>
  stripDiacritics(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Clé de dédup : nom + ville normalisés (minuscule, sans accents ni ponctuation). */
export const normalizePlaceKey = (name: string, city: string | null): string =>
  `${slug(name)}|${slug(city ?? '')}`;

export const importedPlaceUrl = (userId: string, key: string): string =>
  `imported:${userId}:${key}`;

export interface ImportedPlaceRef {
  id: string;
  /** WKT `POINT(lng lat)` quand on a pu géocoder l'adresse, sinon `null`. */
  coordinates: string | null;
}

type Db = Context['db'];
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

/**
 * Ville du lieu : une ligne `cities` quand on connaît la ville et le pays, sinon ce qu'on
 * sait gardé dans `place_details.details.location` (rien n'est perdu).
 */
async function resolveLocation(
  tx: Tx,
  city: string | null,
  country: string | null,
): Promise<{ cityId: number | null; location: PlaceDetailsData['location'] | null }> {
  if (city !== null && country !== null) {
    return { cityId: await ensureCity(tx, city, country), location: null };
  }
  if (city === null && country === null) return { cityId: null, location: null };
  return { cityId: null, location: { city, country } };
}

/** Écrit (ou enrichit) le lieu dans le catalogue et renvoie son id et ses coordonnées. */
async function writeImportedPlace(
  db: Db,
  userId: string,
  url: string,
  place: ExtractedPlace,
  previewImageUrl: string | null | undefined,
): Promise<{ id: string; lat: number | null; lng: number | null }> {
  const category: PlaceCategory = place.category ?? 'autre';

  return db.transaction(async (tx) => {
    // 1. Nouveau lieu : on le crée. Une insertion concurrente sur la même URL ne fait rien.
    const first = await resolveLocation(tx, place.city, place.country);
    const [created] = await tx
      .insert(places)
      .values({
        category: toCatalogueCategory(category),
        ownerUserId: userId,
        cityId: first.cityId,
        name: place.name,
        shortDescription: place.description,
        mainPhoto: previewImageUrl || null,
        source: 'import',
        sourceUrl: url,
        isActive: false,
      })
      .onConflictDoNothing({ target: places.sourceUrl })
      .returning({ id: places.id, lat: places.lat, lng: places.lng });

    if (created) {
      await tx.insert(placeDetails).values({
        placeId: created.id,
        description: place.description,
        sourceTags: { category },
        details: first.location ? { location: first.location } : null,
      });
      return created;
    }

    // 2. Lieu déjà connu : on complète ce qui manque sans écraser ce qui est renseigné.
    const [existing] = await tx
      .select({
        id: places.id,
        cityId: places.cityId,
        mainPhoto: places.mainPhoto,
        lat: places.lat,
        lng: places.lng,
        description: placeDetails.description,
        details: placeDetails.details,
        sourceTags: placeDetails.sourceTags,
      })
      .from(places)
      .leftJoin(placeDetails, eq(placeDetails.placeId, places.id))
      .where(eq(places.sourceUrl, url))
      .for('update', { of: places });

    const description = appendDescription(existing.description, place.description);
    const details: PlaceDetailsData = { ...(existing.details ?? {}) };
    let cityId = existing.cityId;
    if (cityId === null) {
      const known = existing.details?.location;
      const merged = await resolveLocation(
        tx,
        known?.city ?? place.city,
        known?.country ?? place.country,
      );
      cityId = merged.cityId;
      if (merged.location) details.location = merged.location;
      else delete details.location;
    }

    await tx
      .update(places)
      .set({
        cityId,
        shortDescription: description,
        mainPhoto: existing.mainPhoto || previewImageUrl || null,
        updatedAt: sql`now()`,
      })
      .where(eq(places.id, existing.id));

    await tx
      .insert(placeDetails)
      .values({
        placeId: existing.id,
        description,
        sourceTags: existing.sourceTags ?? { category },
        details: Object.keys(details).length > 0 ? details : null,
      })
      .onConflictDoUpdate({
        target: placeDetails.placeId,
        set: {
          description,
          sourceTags: existing.sourceTags ?? { category },
          details: Object.keys(details).length > 0 ? details : null,
        },
      });

    return { id: existing.id, lat: existing.lat, lng: existing.lng };
  });
}

/**
 * Crée (ou retrouve) l'élément lieu d'un utilisateur et renvoie sa référence.
 * Idempotent : appelable à l'analyse comme à l'ajout au voyage. Renvoie `null` si le lieu
 * n'a pas de nom exploitable. Si le lieu a une adresse et pas encore de coordonnées, on
 * géocode l'adresse (OpenStreetMap) pour pouvoir le placer sur la carte et calculer des
 * distances.
 */
export async function upsertImportedPlace(
  db: Db,
  userId: string,
  place: ExtractedPlace,
  previewImageUrl?: string | null,
): Promise<ImportedPlaceRef | null> {
  if (!slug(place.name)) return null;

  const url = importedPlaceUrl(userId, normalizePlaceKey(place.name, place.city));
  const row = await writeImportedPlace(db, userId, url, place, previewImageUrl);

  if (row.lat !== null && row.lng !== null) {
    return { id: row.id, coordinates: toWktPoint({ lat: row.lat, lng: row.lng }) };
  }

  // Géocodage ponctuel : seulement si on a une adresse et pas encore de coordonnées.
  if (place.address) {
    const geo = await geocodeAddress(place.address);
    if (geo) {
      await db
        .update(places)
        .set({ lat: geo.lat, lng: geo.lng, updatedAt: sql`now()` })
        .where(eq(places.id, row.id));
      return { id: row.id, coordinates: toWktPoint(geo) };
    }
  }

  return { id: row.id, coordinates: null };
}
