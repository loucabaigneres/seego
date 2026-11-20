import { sql } from 'drizzle-orm';
import {
  bigserial,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Catalogue structuré (refonte de `discovery_content`).
 *
 * Ce que le feed et l'algorithme lisent en permanence est dans `places`, en colonnes typées ;
 * les textes longs, lus à l'ouverture d'une fiche, dans `place_details` ; les prix datés dans
 * `place_prices`. Les listes de valeurs (thèmes, cuisines…) sont contrôlées par `vocabulary`.
 *
 * Migration sans perte : chaque ligne de l'ancienne table est gardée telle quelle dans
 * `place_details.details->'legacy'`, et les lieux gardent le même `id` (swipes, activités).
 */

export const placeCategories = ['hotel', 'restaurant', 'activity', 'other'] as const;
export type CataloguePlaceCategory = (typeof placeCategories)[number];

export const cities = pgTable(
  'cities',
  {
    id: serial('id').primaryKey(),
    // Écrit exactement comme dans l'ancienne table : `trip.destination` stocke ce texte.
    name: text('name').notNull(),
    country: text('country').notNull(),
    lat: doublePrecision('lat'), // centre approximatif (moyenne des lieux)
    lng: doublePrecision('lng'),
    timezone: text('timezone'),
  },
  (t) => [unique('cities_name_country_unique').on(t.name, t.country)],
);

export const vocabulary = pgTable(
  'vocabulary',
  {
    kind: text('kind').notNull(), // theme, cuisine, ambiance, amenity, hotel_style, good_for…
    slug: text('slug').notNull(), // identifiant stable stocké dans `places`
    label: text('label').notNull(), // libellé affiché
    category: text('category'), // catégorie de lieu concernée (null = toutes)
    position: smallint('position').notNull().default(0),
  },
  (t) => [primaryKey({ name: 'vocabulary_kind_slug_pk', columns: [t.kind, t.slug] })],
);

export const places = pgTable(
  'places',
  {
    // Même identifiant que l'ancien discovery_content (swipes, activités)
    id: uuid('id').primaryKey().defaultRandom(),
    category: text('category').$type<CataloguePlaceCategory>().notNull(),
    // Lieux importés depuis une inspiration : rattachés à un utilisateur, inactifs.
    // `null` = catalogue global.
    ownerUserId: text('owner_user_id'),
    cityId: integer('city_id').references(() => cities.id),
    name: text('name').notNull(),
    shortDescription: text('short_description'), // 1 à 2 phrases, sans markdown
    address: text('address'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    mainPhoto: text('main_photo'),
    photos: text('photos')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`), // sans la principale
    // Note ramenée sur 5 quelle que soit la source
    rating: numeric('rating', { precision: 3, scale: 2 }),
    ratingCount: integer('rating_count'),
    ratingSource: text('rating_source'),
    // Prix fixe par personne pour les activités seulement ; niveau 1 à 4 pour tous
    priceEur: numeric('price_eur', { precision: 8, scale: 2 }),
    priceLevel: smallint('price_level'),
    durationMin: integer('duration_min'), // activités
    stars: smallint('stars'), // hôtels
    // Vocabulaires contrôlés (slugs de `vocabulary`)
    themes: text('themes')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    cuisines: text('cuisines')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ambiance: text('ambiance')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    amenities: text('amenities')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    hotelStyle: text('hotel_style'),
    goodFor: text('good_for')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    setting: text('setting'),
    openingHours: jsonb('opening_hours'),
    // Critères de l'algorithme : un booléen NULL = inconnu, jamais « non » par défaut
    petsAllowed: boolean('pets_allowed'),
    wheelchairAccessible: boolean('wheelchair_accessible'),
    familyFriendly: boolean('family_friendly'),
    languages: text('languages')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // Activités
    freeCancellation: boolean('free_cancellation'),
    payLater: boolean('pay_later'),
    minAge: smallint('min_age'),
    guideType: text('guide_type'),
    smallGroup: boolean('small_group'),
    skipTheLine: boolean('skip_the_line'),
    pickupIncluded: boolean('pickup_included'),
    notSuitableFor: text('not_suitable_for')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    meetingLat: doublePrecision('meeting_lat'),
    meetingLng: doublePrecision('meeting_lng'),
    endPoint: text('end_point'),
    physicalLevel: text('physical_level'),
    timeOfDay: text('time_of_day')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    foodIncluded: boolean('food_included'),
    // Hôtels
    checkInFrom: time('check_in_from'),
    checkOutUntil: time('check_out_until'),
    breakfastTypes: text('breakfast_types')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    beachDistanceM: integer('beach_distance_m'),
    airportDistanceKm: numeric('airport_distance_km', { precision: 6, scale: 1 }),
    nearbyAttractions: jsonb('nearby_attractions'), // [{name, distance_m}]
    hasKitchen: boolean('has_kitchen'),
    airConditioning: boolean('air_conditioning'),
    poolType: text('pool_type'),
    locationScore: numeric('location_score', { precision: 3, scale: 1 }), // /10, Booking
    // Restaurants
    reservations: boolean('reservations'),
    outdoorSeating: boolean('outdoor_seating'),
    takeout: boolean('takeout'),
    delivery: boolean('delivery'),
    groupsFriendly: boolean('groups_friendly'),
    noiseLevel: text('noise_level'),
    meals: text('meals')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    liveMusic: boolean('live_music'),
    fullBar: boolean('full_bar'),
    hasTv: boolean('has_tv'),
    dressCode: text('dress_code'),
    // Source et état
    source: text('source'), // booking, getyourguide, yelp, michelin, import…
    sourceUrl: text('source_url').notNull().unique(),
    qualityScore: smallint('quality_score'), // 0 à 100
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      'places_category_check',
      sql`${t.category} IN ('hotel', 'restaurant', 'activity', 'other')`,
    ),
    check('places_rating_check', sql`${t.rating} BETWEEN 0 AND 5`),
    check('places_price_eur_check', sql`${t.priceEur} IS NULL OR ${t.category} = 'activity'`),
    check('places_price_level_check', sql`${t.priceLevel} BETWEEN 1 AND 4`),
    check('places_stars_check', sql`${t.stars} BETWEEN 1 AND 5`),
    check('places_quality_score_check', sql`${t.qualityScore} BETWEEN 0 AND 100`),
    // Un lieu actif du catalogue doit avoir ville, photo et catégorie. Les lieux importés
    // (rattachés à un utilisateur) et les lieux masqués peuvent rester incomplets.
    check(
      'places_catalogue_complete_check',
      sql`${t.ownerUserId} IS NOT NULL OR NOT ${t.isActive} OR (${t.cityId} IS NOT NULL AND ${t.mainPhoto} IS NOT NULL AND ${t.category} <> 'other')`,
    ),
    index('places_city_category')
      .on(t.cityId, t.category)
      .where(sql`${t.isActive}`),
    index('places_owner')
      .on(t.ownerUserId)
      .where(sql`${t.ownerUserId} IS NOT NULL`),
    index('places_themes').using('gin', t.themes),
    index('places_cuisines').using('gin', t.cuisines),
    index('places_amenities').using('gin', t.amenities),
    index('places_languages').using('gin', t.languages),
    index('places_not_suitable').using('gin', t.notSuitableFor),
  ],
);

/**
 * Contenu de `place_details.details` connu de l'app. `legacy` est la ligne d'origine de
 * `discovery_content`, intacte ; `location` garde la ville / le pays d'un lieu qui n'a pas
 * de ligne `cities` (lieu importé sans pays, par exemple).
 */
export type PlaceDetailsData = {
  legacy?: Record<string, unknown>;
  location?: { city: string | null; country: string | null };
  [key: string]: unknown;
};

// Textes longs et détails bruts de la source, lus seulement à l'ouverture d'une fiche
export const placeDetails = pgTable('place_details', {
  placeId: uuid('place_id')
    .primaryKey()
    .references(() => places.id, { onDelete: 'cascade' }),
  description: text('description'), // description complète d'origine
  details: jsonb('details').$type<PlaceDetailsData>(),
  subRatings: jsonb('sub_ratings'), // [{label, value, max}]
  sourceTags: jsonb('source_tags'), // étiquettes brutes de la source : rien n'est perdu
  scrapedAt: timestamp('scraped_at', { withTimezone: true }),
});

// Prix constatés à une date donnée (hôtels, restaurants) : information, pas critère
export const placePrices = pgTable(
  'place_prices',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    placeId: uuid('place_id')
      .notNull()
      .references(() => places.id, { onDelete: 'cascade' }),
    checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
    priceEur: numeric('price_eur', { precision: 8, scale: 2 }).notNull(),
    basis: text('basis').notNull(), // nuit, personne, repas
    params: jsonb('params'), // dates, adultes
    platform: text('platform'),
    url: text('url'),
  },
  (t) => [index('place_prices_place').on(t.placeId, t.checkedAt.desc())],
);

// Étiquettes produites par l'IA, mémorisées (empreinte `input_hash`)
export const placeAiLabels = pgTable('place_ai_labels', {
  placeId: uuid('place_id')
    .primaryKey()
    .references(() => places.id, { onDelete: 'cascade' }),
  inputHash: text('input_hash').notNull(),
  labels: jsonb('labels').notNull(),
  model: text('model').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
