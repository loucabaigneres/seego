import {
  boolean,
  jsonb,
  pgTable,
  pgView,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { platformEnum, processingStatus, swipeDirectionEnum } from '../enums.js';
import { places } from './catalogue.js';

export type DiscoveryTags = {
  category?: string;
  subcategory?: string[];
  [key: string]: unknown;
};

/** Catégories alignées sur le système d'itinéraire (remplacement par catégorie). */
export type PlaceCategory = 'restaurant' | 'hotel' | 'activité' | 'autre';

/**
 * Lieu extrait d'une publication par l'analyse IA. L'adresse est « best-effort » :
 * renseignée seulement quand le modèle la connaît avec une confiance raisonnable,
 * sinon on se contente de la ville / du pays.
 */
export type ExtractedPlace = {
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  // Catégorie déduite par l'IA, pour rattacher le lieu au bon « bucket » de remplacement.
  category: PlaceCategory | null;
};

export const importedInspiration = pgTable('imported_inspiration', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  platform: platformEnum('platform').notNull(),
  originalUrl: text('original_url').notNull(),
  // Légende brute de la publication, telle que récupérée (ou collée à la main).
  description: text('description'),
  extracted_location: text('extracted_location').notNull(),
  extracted_tags: jsonb('extracted_tags').notNull(),
  aiReport: text('ai_report'),
  type: text('type').$type<PlaceCategory>(),
  city: text('city'),
  extractedPlaces: jsonb('extracted_places').$type<ExtractedPlace[]>(),
  status: processingStatus('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

/**
 * Ancienne table du catalogue, renommée par la migration 0007 et gardée en lecture seule
 * (un trigger refuse toute écriture) jusqu'à son archivage. On écrit dans `places` /
 * `place_details` (voir catalogue.ts et catalogue/write.ts).
 */
export const legacyDiscoveryContent = pgTable('legacy_discovery_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull().unique(),
  ownerUserId: text('owner_user_id'),
  mainMediaUrl: text('main_media_url').notNull(),
  carousselUrls: text('caroussel_urls').array(),
  locationName: text('location_name'),
  title: text('title'),
  description: text('description'),
  country: text('country'),
  city: text('city'),
  coordinates: text('coordinates'),
  tags: jsonb('tags').$type<DiscoveryTags>(),
  isActive: boolean('is_active').default(true),
});

/**
 * Vue en lecture seule : le catalogue (`places`, `cities`, `place_details`) présenté au
 * format de l'ancienne table, pour que les lectures de l'app ne changent pas.
 * Définie dans la migration 0007 (`.existing()` : drizzle-kit ne la gère pas).
 */
export const discoveryContent = pgView('discovery_content', {
  id: uuid('id').notNull(),
  url: text('url').notNull(),
  // Lieu importé depuis une inspiration : rattaché à un utilisateur. `null` = catalogue
  // global. Les lignes importées restent `isActive=false` pour rester hors du feed de
  // découverte et de la génération d'itinéraire ; elles ne servent qu'au remplacement.
  ownerUserId: text('owner_user_id'),
  mainMediaUrl: text('main_media_url').notNull(),
  carousselUrls: text('caroussel_urls').array(),
  locationName: text('location_name'),
  title: text('title'),
  description: text('description'),
  country: text('country'),
  city: text('city'),
  coordinates: text('coordinates'),
  tags: jsonb('tags').$type<DiscoveryTags>(),
  isActive: boolean('is_active'),
}).existing();

export const swipes = pgTable(
  'swipe',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    // Pointe sur `places` (même id que l'ancien discovery_content)
    discoveryContentId: uuid('discovery_content_id')
      .references(() => places.id)
      .notNull(),
    direction: swipeDirectionEnum('direction').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('user_swipe_idx').on(table.userId, table.discoveryContentId)],
);
