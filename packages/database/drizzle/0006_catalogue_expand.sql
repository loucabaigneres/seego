CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"timezone" text,
	CONSTRAINT "cities_name_country_unique" UNIQUE("name","country")
);
--> statement-breakpoint
CREATE TABLE "place_ai_labels" (
	"place_id" uuid PRIMARY KEY NOT NULL,
	"input_hash" text NOT NULL,
	"labels" jsonb NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place_details" (
	"place_id" uuid PRIMARY KEY NOT NULL,
	"description" text,
	"details" jsonb,
	"sub_ratings" jsonb,
	"source_tags" jsonb,
	"scraped_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "place_prices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"place_id" uuid NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"price_eur" numeric(8, 2) NOT NULL,
	"basis" text NOT NULL,
	"params" jsonb,
	"platform" text,
	"url" text
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"owner_user_id" text,
	"city_id" integer,
	"name" text NOT NULL,
	"short_description" text,
	"address" text,
	"lat" double precision,
	"lng" double precision,
	"main_photo" text,
	"photos" text[] DEFAULT '{}'::text[] NOT NULL,
	"rating" numeric(3, 2),
	"rating_count" integer,
	"rating_source" text,
	"price_eur" numeric(8, 2),
	"price_level" smallint,
	"duration_min" integer,
	"stars" smallint,
	"themes" text[] DEFAULT '{}'::text[] NOT NULL,
	"cuisines" text[] DEFAULT '{}'::text[] NOT NULL,
	"ambiance" text[] DEFAULT '{}'::text[] NOT NULL,
	"amenities" text[] DEFAULT '{}'::text[] NOT NULL,
	"hotel_style" text,
	"good_for" text[] DEFAULT '{}'::text[] NOT NULL,
	"setting" text,
	"opening_hours" jsonb,
	"pets_allowed" boolean,
	"wheelchair_accessible" boolean,
	"family_friendly" boolean,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"free_cancellation" boolean,
	"pay_later" boolean,
	"min_age" smallint,
	"guide_type" text,
	"small_group" boolean,
	"skip_the_line" boolean,
	"pickup_included" boolean,
	"not_suitable_for" text[] DEFAULT '{}'::text[] NOT NULL,
	"meeting_lat" double precision,
	"meeting_lng" double precision,
	"end_point" text,
	"physical_level" text,
	"time_of_day" text[] DEFAULT '{}'::text[] NOT NULL,
	"food_included" boolean,
	"check_in_from" time,
	"check_out_until" time,
	"breakfast_types" text[] DEFAULT '{}'::text[] NOT NULL,
	"beach_distance_m" integer,
	"airport_distance_km" numeric(6, 1),
	"nearby_attractions" jsonb,
	"has_kitchen" boolean,
	"air_conditioning" boolean,
	"pool_type" text,
	"location_score" numeric(3, 1),
	"reservations" boolean,
	"outdoor_seating" boolean,
	"takeout" boolean,
	"delivery" boolean,
	"groups_friendly" boolean,
	"noise_level" text,
	"meals" text[] DEFAULT '{}'::text[] NOT NULL,
	"live_music" boolean,
	"full_bar" boolean,
	"has_tv" boolean,
	"dress_code" text,
	"source" text,
	"source_url" text NOT NULL,
	"quality_score" smallint,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "places_source_url_unique" UNIQUE("source_url"),
	CONSTRAINT "places_category_check" CHECK ("places"."category" IN ('hotel', 'restaurant', 'activity', 'other')),
	CONSTRAINT "places_rating_check" CHECK ("places"."rating" BETWEEN 0 AND 5),
	CONSTRAINT "places_price_eur_check" CHECK ("places"."price_eur" IS NULL OR "places"."category" = 'activity'),
	CONSTRAINT "places_price_level_check" CHECK ("places"."price_level" BETWEEN 1 AND 4),
	CONSTRAINT "places_stars_check" CHECK ("places"."stars" BETWEEN 1 AND 5),
	CONSTRAINT "places_quality_score_check" CHECK ("places"."quality_score" BETWEEN 0 AND 100),
	CONSTRAINT "places_catalogue_complete_check" CHECK ("places"."owner_user_id" IS NOT NULL OR NOT "places"."is_active" OR ("places"."city_id" IS NOT NULL AND "places"."main_photo" IS NOT NULL AND "places"."category" <> 'other'))
);
--> statement-breakpoint
CREATE TABLE "vocabulary" (
	"kind" text NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"category" text,
	"position" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "vocabulary_kind_slug_pk" PRIMARY KEY("kind","slug")
);
--> statement-breakpoint
ALTER TABLE "swipe" DROP CONSTRAINT "swipe_discovery_content_id_discovery_content_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_discovery_content_id_discovery_content_id_fk";
--> statement-breakpoint
ALTER TABLE "place_ai_labels" ADD CONSTRAINT "place_ai_labels_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_details" ADD CONSTRAINT "place_details_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_prices" ADD CONSTRAINT "place_prices_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "place_prices_place" ON "place_prices" USING btree ("place_id","checked_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "places_city_category" ON "places" USING btree ("city_id","category") WHERE "places"."is_active";--> statement-breakpoint
CREATE INDEX "places_owner" ON "places" USING btree ("owner_user_id") WHERE "places"."owner_user_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "places_themes" ON "places" USING gin ("themes");--> statement-breakpoint
CREATE INDEX "places_cuisines" ON "places" USING gin ("cuisines");--> statement-breakpoint
CREATE INDEX "places_amenities" ON "places" USING gin ("amenities");--> statement-breakpoint
CREATE INDEX "places_languages" ON "places" USING gin ("languages");--> statement-breakpoint
CREATE INDEX "places_not_suitable" ON "places" USING gin ("not_suitable_for");--> statement-breakpoint
-- ─── Recopie sans perte de discovery_content vers le catalogue ─────────────────────────
-- Une seule fonction convertit une ligne de l'ancienne table : elle sert à la recopie initiale
-- et au trigger miroir (tant que l'ancienne API écrit encore dans discovery_content).
-- Règles : même id ; ville et pays écrits exactement comme avant ; la ligne d'origine est
-- gardée intacte dans place_details.details->'legacy' ; NULL dans is_active reste masqué.
CREATE FUNCTION "catalogue_sync_legacy_row"(d "discovery_content") RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_category text;
  v_city_id integer;
  v_point text[];
  v_details jsonb;
BEGIN
  v_category := CASE d.tags->>'category'
    WHEN 'hotel' THEN 'hotel'
    WHEN 'restaurant' THEN 'restaurant'
    WHEN 'activité' THEN 'activity'
    WHEN 'activity' THEN 'activity'
    ELSE 'other'
  END;

  IF d.city IS NOT NULL AND d.country IS NOT NULL THEN
    INSERT INTO "cities" ("name", "country") VALUES (d.city, d.country)
    ON CONFLICT ("name", "country") DO NOTHING;
    SELECT "id" INTO v_city_id FROM "cities" WHERE "name" = d.city AND "country" = d.country;
  END IF;

  v_point := regexp_match(
    d.coordinates,
    '^\s*POINT\s*\(\s*(-?[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?)\s+(-?[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?)\s*\)\s*$',
    'i'
  );

  v_details := jsonb_build_object('legacy', to_jsonb(d));
  IF v_city_id IS NULL AND (d.city IS NOT NULL OR d.country IS NOT NULL) THEN
    v_details := v_details || jsonb_build_object(
      'location', jsonb_build_object('city', d.city, 'country', d.country)
    );
  END IF;

  INSERT INTO "places" (
    "id", "category", "owner_user_id", "city_id", "name", "short_description",
    "lat", "lng", "main_photo", "photos", "price_level", "source", "source_url", "is_active"
  ) VALUES (
    d.id,
    v_category,
    d.owner_user_id,
    v_city_id,
    coalesce(nullif(d.location_name, ''), nullif(d.title, ''), 'Lieu sans nom'),
    nullif(btrim(regexp_replace(d.description, '\*\*|__', '', 'g')), ''),
    v_point[2]::double precision,
    v_point[1]::double precision,
    nullif(d.main_media_url, ''),
    coalesce(d.caroussel_urls, '{}'::text[]),
    CASE WHEN d.tags->>'price' ~ '^\$\$?\$?\$?$' THEN length(d.tags->>'price') END,
    CASE
      WHEN d.owner_user_id IS NOT NULL OR d.url LIKE 'imported:%' THEN 'import'
      WHEN d.url ~* 'booking\.com' THEN 'booking'
      WHEN d.url ~* 'getyourguide\.' THEN 'getyourguide'
      WHEN d.url ~* 'yelp\.' THEN 'yelp'
      WHEN d.url ~* 'michelin\.' THEN 'michelin'
      ELSE substring(d.url FROM '^https?://(?:www\.)?([^/]+)')
    END,
    d.url,
    coalesce(d.is_active, false)
  )
  ON CONFLICT ("id") DO UPDATE SET
    "category" = excluded."category",
    "owner_user_id" = excluded."owner_user_id",
    "city_id" = excluded."city_id",
    "name" = excluded."name",
    "short_description" = excluded."short_description",
    "lat" = excluded."lat",
    "lng" = excluded."lng",
    "main_photo" = excluded."main_photo",
    "photos" = excluded."photos",
    "price_level" = excluded."price_level",
    "source" = excluded."source",
    "source_url" = excluded."source_url",
    "is_active" = excluded."is_active",
    "updated_at" = now();

  INSERT INTO "place_details" ("place_id", "description", "source_tags", "details")
  VALUES (d.id, d.description, d.tags, v_details)
  ON CONFLICT ("place_id") DO UPDATE SET
    "description" = excluded."description",
    "source_tags" = excluded."source_tags",
    "details" = (coalesce("place_details"."details", '{}'::jsonb) - 'location') || excluded."details";
END;
$$;
--> statement-breakpoint
SELECT "catalogue_sync_legacy_row"(d) FROM "discovery_content" d ORDER BY d.id;
--> statement-breakpoint
-- Centre de chaque ville : moyenne des coordonnées de ses lieux
UPDATE "cities" c SET "lat" = s.lat, "lng" = s.lng
FROM (
  SELECT "city_id", avg("lat") AS lat, avg("lng") AS lng
  FROM "places" WHERE "lat" IS NOT NULL AND "lng" IS NOT NULL GROUP BY "city_id"
) s
WHERE s."city_id" = c."id" AND c."lat" IS NULL;
--> statement-breakpoint
-- Miroir : tant que l'ancienne API tourne, ce qu'elle écrit dans discovery_content arrive aussi
-- dans le catalogue. Supprimé par la migration suivante (renommage de la table).
CREATE FUNCTION "catalogue_mirror_legacy"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM "places" WHERE "id" = OLD."id";
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW."id" <> OLD."id" THEN
    RAISE EXCEPTION 'discovery_content.id ne doit pas changer pendant la migration du catalogue';
  END IF;
  PERFORM "catalogue_sync_legacy_row"(NEW);
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "discovery_content_mirror"
AFTER INSERT OR UPDATE OR DELETE ON "discovery_content"
FOR EACH ROW EXECUTE FUNCTION "catalogue_mirror_legacy"();
--> statement-breakpoint
-- Contrôles bloquants : au moindre écart, toute la migration est annulée.
DO $$
DECLARE
  n_legacy bigint;
  n_missing bigint;
  n_diff bigint;
BEGIN
  SELECT count(*) INTO n_legacy FROM "discovery_content";

  SELECT count(*) INTO n_missing FROM "discovery_content" d
  WHERE NOT EXISTS (SELECT 1 FROM "places" p WHERE p."id" = d."id" AND p."source_url" = d."url");
  IF n_missing > 0 THEN
    RAISE EXCEPTION 'Catalogue : % lieu(x) sur % absents de places (même id, même url)', n_missing, n_legacy;
  END IF;

  SELECT count(*) INTO n_diff FROM "discovery_content" d
  LEFT JOIN "place_details" pd ON pd."place_id" = d."id"
  WHERE pd."place_id" IS NULL
     OR pd."details"->'legacy' IS DISTINCT FROM to_jsonb(d)
     OR pd."description" IS DISTINCT FROM d."description"
     OR pd."source_tags" IS DISTINCT FROM d."tags";
  IF n_diff > 0 THEN
    RAISE EXCEPTION 'Catalogue : % ligne(s) d''origine mal recopiées dans place_details', n_diff;
  END IF;

  SELECT count(*) INTO n_diff FROM "discovery_content" d
  JOIN "places" p ON p."id" = d."id"
  LEFT JOIN "cities" c ON c."id" = p."city_id"
  LEFT JOIN "place_details" pd ON pd."place_id" = d."id"
  WHERE coalesce(c."name", pd."details"->'location'->>'city') IS DISTINCT FROM d."city"
     OR coalesce(c."country", pd."details"->'location'->>'country') IS DISTINCT FROM d."country"
     OR p."is_active" IS DISTINCT FROM coalesce(d."is_active", false)
     OR p."owner_user_id" IS DISTINCT FROM d."owner_user_id";
  IF n_diff > 0 THEN
    RAISE EXCEPTION 'Catalogue : % lieu(x) avec ville, pays, état ou propriétaire différents', n_diff;
  END IF;

  RAISE NOTICE 'Catalogue : % lieu(x) recopiés sans écart', n_legacy;
END;
$$;
--> statement-breakpoint
ALTER TABLE "swipe" ADD CONSTRAINT "swipe_discovery_content_id_places_id_fk" FOREIGN KEY ("discovery_content_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_discovery_content_id_places_id_fk" FOREIGN KEY ("discovery_content_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;