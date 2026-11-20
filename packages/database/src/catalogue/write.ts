import { and, eq, sql } from 'drizzle-orm';
import type { createClient } from '../index.js';
import {
  type CataloguePlaceCategory,
  cities,
  type PlaceDetailsData,
  placeDetails,
  places,
} from '../schemas/catalogue.js';

/** Base ou transaction : les fonctions d'écriture acceptent l'une comme l'autre. */
export type CatalogueExecutor = Pick<
  ReturnType<typeof createClient>,
  'insert' | 'select' | 'update' | 'execute'
>;

/** Catégorie de l'ancien format (`tags.category`) vers celle du catalogue. */
export function toCatalogueCategory(category: unknown): CataloguePlaceCategory {
  switch (category) {
    case 'hotel':
      return 'hotel';
    case 'restaurant':
      return 'restaurant';
    case 'activité':
    case 'activity':
      return 'activity';
    default:
      return 'other';
  }
}

/** Catégorie du catalogue vers celle que l'app attend dans `tags.category`. */
export function toLegacyCategory(category: CataloguePlaceCategory): string {
  return category === 'activity' ? 'activité' : category === 'other' ? 'autre' : category;
}

/**
 * Renvoie l'id de la ville, créée si besoin. Le nom et le pays sont gardés tels quels :
 * `trip.destination` stocke ce texte et l'itinéraire filtre dessus.
 */
export async function ensureCity(
  db: CatalogueExecutor,
  name: string,
  country: string,
): Promise<number> {
  await db.insert(cities).values({ name, country }).onConflictDoNothing();
  const [row] = await db
    .select({ id: cities.id })
    .from(cities)
    .where(and(eq(cities.name, name), eq(cities.country, country)));
  return row.id;
}

/**
 * Ajoute une nouvelle précision à une description, sauf si elle y figure déjà
 * (même règle que l'ancien enrichissement de `discovery_content.description`).
 */
export function appendDescription(existing: string | null, incoming: string | null): string | null {
  if (existing === null) return incoming;
  if (incoming === null) return existing;
  if (existing.includes(incoming)) return existing;
  return `${existing}\n\n${incoming}`;
}

const WKT_POINT =
  /^\s*POINT\s*\(\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s+(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*\)\s*$/i;

/** `POINT(lng lat)` vers coordonnées, `null` si le texte n'est pas reconnu. */
export function parseLegacyPoint(wkt: string | null | undefined) {
  const m = wkt?.match(WKT_POINT);
  return m ? { lng: Number(m[1]), lat: Number(m[2]) } : null;
}

function sourceOf(url: string, ownerUserId: string | null): string | null {
  if (ownerUserId || url.startsWith('imported:')) return 'import';
  if (/booking\.com/i.test(url)) return 'booking';
  if (/getyourguide\./i.test(url)) return 'getyourguide';
  if (/yelp\./i.test(url)) return 'yelp';
  if (/michelin\./i.test(url)) return 'michelin';
  return url.match(/^https?:\/\/(?:www\.)?([^/]+)/)?.[1] ?? null;
}

/** Une ligne au format de l'ancienne table `discovery_content`. */
export type LegacyPlaceRow = {
  id?: string | null;
  url: string;
  ownerUserId?: string | null;
  mainMediaUrl: string;
  carousselUrls?: string[] | null;
  locationName?: string | null;
  title?: string | null;
  description?: string | null;
  country?: string | null;
  city?: string | null;
  coordinates?: string | null;
  tags?: unknown;
  isActive?: boolean | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Écrit un lieu de l'ancien format dans le catalogue, avec les mêmes règles que la
 * migration 0007 : rien n'est perdu, la ligne d'origine est gardée dans
 * `place_details.details.legacy`. Ne fait rien si l'URL existe déjà. Renvoie l'id créé.
 */
export async function insertLegacyPlace(
  db: CatalogueExecutor,
  item: LegacyPlaceRow,
): Promise<string | null> {
  const tags = (item.tags ?? null) as Record<string, unknown> | null;
  const city = item.city ?? null;
  const country = item.country ?? null;
  const cityId = city !== null && country !== null ? await ensureCity(db, city, country) : null;
  const point = parseLegacyPoint(item.coordinates);
  const price = typeof tags?.price === 'string' ? tags.price : '';
  const ownerUserId = item.ownerUserId ?? null;

  const legacy = {
    id: item.id ?? null,
    url: item.url,
    owner_user_id: ownerUserId,
    main_media_url: item.mainMediaUrl,
    caroussel_urls: item.carousselUrls ?? null,
    location_name: item.locationName ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    country,
    city,
    coordinates: item.coordinates ?? null,
    tags,
    is_active: item.isActive ?? null,
  };
  const details: PlaceDetailsData = { legacy };
  if (cityId === null && (city !== null || country !== null)) details.location = { city, country };

  const [row] = await db
    .insert(places)
    .values({
      ...(item.id && UUID.test(item.id) ? { id: item.id } : {}),
      category: toCatalogueCategory(tags?.category),
      ownerUserId,
      cityId,
      name: item.locationName || item.title || 'Lieu sans nom',
      shortDescription: item.description?.replace(/\*\*|__/g, '').trim() || null,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
      mainPhoto: item.mainMediaUrl || null,
      photos: item.carousselUrls ?? [],
      priceLevel: /^\${1,4}$/.test(price) ? price.length : null,
      source: sourceOf(item.url, ownerUserId),
      sourceUrl: item.url,
      // Absent = actif (défaut de l'ancienne table) ; NULL était masqué par l'app.
      isActive: item.isActive === undefined ? true : (item.isActive ?? false),
    })
    .onConflictDoNothing({ target: places.sourceUrl })
    .returning({ id: places.id });
  if (!row) return null;

  legacy.id = row.id;
  await db.insert(placeDetails).values({
    placeId: row.id,
    description: item.description ?? null,
    sourceTags: tags,
    details,
  });
  return row.id;
}

/** Centre de chaque ville sans coordonnées : moyenne des coordonnées de ses lieux. */
export async function fillCityCenters(db: CatalogueExecutor): Promise<void> {
  await db.execute(sql`
    UPDATE ${cities} c SET lat = s.lat, lng = s.lng
    FROM (
      SELECT city_id, avg(lat) AS lat, avg(lng) AS lng FROM ${places}
      WHERE lat IS NOT NULL AND lng IS NOT NULL GROUP BY city_id
    ) s
    WHERE s.city_id = c.id AND c.lat IS NULL`);
}
