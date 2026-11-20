-- Release C de la migration du catalogue : l'ancienne table devient une archive en lecture
-- seule et l'app lit le catalogue par une vue au format de l'ancienne table.
-- Prérequis : l'API ne doit plus écrire dans discovery_content (release B déployée).

-- 1. Plus de recopie : plus personne n'écrit dans l'ancienne table.
DROP TRIGGER "discovery_content_mirror" ON "discovery_content";
--> statement-breakpoint
DROP FUNCTION "catalogue_mirror_legacy"();
--> statement-breakpoint
DROP FUNCTION "catalogue_sync_legacy_row"("discovery_content");
--> statement-breakpoint

-- 2. L'ancienne table est renommée (rien n'est supprimé) et passe en lecture seule.
ALTER TABLE "discovery_content" RENAME TO "legacy_discovery_content";
--> statement-breakpoint
ALTER TABLE "legacy_discovery_content" RENAME CONSTRAINT "discovery_content_pkey" TO "legacy_discovery_content_pkey";
--> statement-breakpoint
ALTER TABLE "legacy_discovery_content" RENAME CONSTRAINT "discovery_content_url_unique" TO "legacy_discovery_content_url_unique";
--> statement-breakpoint
CREATE FUNCTION "legacy_discovery_content_read_only"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'legacy_discovery_content est une archive en lecture seule : on écrit dans places et place_details';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "legacy_discovery_content_read_only"
BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "legacy_discovery_content"
FOR EACH STATEMENT EXECUTE FUNCTION "legacy_discovery_content_read_only"();
--> statement-breakpoint

-- 3. La vue au format de l'ancienne table. Tant qu'un lieu n'a pas été modifié depuis la
-- migration, elle renvoie ses valeurs d'origine (nom, titre, coordonnées écrites à
-- l'identique, étiquettes brutes) ; seule la description est la version courte, sans markdown.
CREATE VIEW "discovery_content" AS
SELECT
  p."id",
  p."source_url" AS "url",
  p."owner_user_id",
  coalesce(p."main_photo", '') AS "main_media_url",
  CASE
    WHEN cardinality(p."photos") = 0 AND x.legacy->'caroussel_urls' = 'null'::jsonb THEN NULL
    ELSE p."photos"
  END AS "caroussel_urls",
  CASE
    WHEN x.legacy IS NOT NULL AND p."name" = coalesce(
      nullif(x.legacy->>'location_name', ''), nullif(x.legacy->>'title', ''), 'Lieu sans nom'
    ) THEN x.legacy->>'location_name'
    ELSE p."name"
  END AS "location_name",
  CASE
    WHEN x.legacy IS NOT NULL THEN x.legacy->>'title'
    WHEN p."owner_user_id" IS NOT NULL THEN p."name"
  END AS "title",
  p."short_description" AS "description",
  coalesce(c."country", pd."details"->'location'->>'country') AS "country",
  coalesce(c."name", pd."details"->'location'->>'city') AS "city",
  CASE
    -- Coordonnées d'origine illisibles, jamais corrigées : on rend le texte d'origine
    WHEN x.legacy->>'coordinates' IS NOT NULL AND x.point IS NULL
      AND p."lat" IS NULL AND p."lng" IS NULL THEN x.legacy->>'coordinates'
    -- Coordonnées inchangées : même texte qu'avant (zéros finaux compris)
    WHEN x.point IS NOT NULL AND x.point[1]::double precision = p."lng"
      AND x.point[2]::double precision = p."lat" THEN x.legacy->>'coordinates'
    WHEN p."lat" IS NOT NULL AND p."lng" IS NOT NULL THEN format('POINT(%s %s)', p."lng", p."lat")
  END AS "coordinates",
  CASE
    WHEN pd."source_tags" IS NOT NULL AND jsonb_typeof(pd."source_tags") <> 'object' THEN pd."source_tags"
    WHEN pd."source_tags" IS NULL AND p."category" = 'other' AND p."price_level" IS NULL
      AND NOT x.labelled THEN NULL
    ELSE coalesce(pd."source_tags", '{}'::jsonb)
      || CASE
           WHEN p."category" = 'other' THEN '{}'::jsonb
           ELSE jsonb_build_object(
             'category', CASE p."category" WHEN 'activity' THEN 'activité' ELSE p."category" END
           )
         END
      || CASE
           WHEN p."price_level" IS NULL THEN '{}'::jsonb
           ELSE jsonb_build_object('price', repeat('$', p."price_level"))
         END
      -- Une fois étiqueté par l'IA, un lieu expose ses valeurs de vocabulary
      || CASE
           WHEN x.labelled THEN jsonb_build_object('subcategory', to_jsonb(
             p."themes" || p."cuisines" || p."ambiance" || p."amenities"
             || array_remove(ARRAY[p."hotel_style"], NULL)
           ))
           ELSE '{}'::jsonb
         END
  END AS "tags",
  p."is_active"
FROM "places" p
LEFT JOIN "cities" c ON c."id" = p."city_id"
LEFT JOIN "place_details" pd ON pd."place_id" = p."id"
CROSS JOIN LATERAL (
  SELECT
    pd."details"->'legacy' AS legacy,
    regexp_match(
      pd."details"->'legacy'->>'coordinates',
      '^\s*POINT\s*\(\s*(-?[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?)\s+(-?[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?)\s*\)\s*$',
      'i'
    ) AS point,
    (cardinality(p."themes") + cardinality(p."cuisines") + cardinality(p."ambiance")
      + cardinality(p."amenities") > 0 OR p."hotel_style" IS NOT NULL) AS labelled
) x;
--> statement-breakpoint

-- 4. Contrôles bloquants : la vue doit rendre chaque ancienne ligne à l'identique, aux seules
-- différences voulues près (description courte sans markdown ; NULL dans is_active devient
-- false, ce qui était déjà masqué ; catégorie 'activity' écrite 'activité'). Les lieux importés
-- ont pu être enrichis depuis la release B : on vérifie seulement qu'ils sont tous là.
DO $$
DECLARE
  n_legacy bigint;
  n_diff bigint;
BEGIN
  SELECT count(*) INTO n_legacy FROM "legacy_discovery_content";

  SELECT count(*) INTO n_diff FROM "legacy_discovery_content" l
  LEFT JOIN "discovery_content" v ON v."id" = l."id"
  WHERE v."id" IS NULL
     OR v."url" IS DISTINCT FROM l."url"
     OR v."owner_user_id" IS DISTINCT FROM l."owner_user_id";
  IF n_diff > 0 THEN
    RAISE EXCEPTION 'Catalogue : % ancienne(s) ligne(s) absente(s) de la vue discovery_content', n_diff;
  END IF;

  SELECT count(*) INTO n_diff FROM "legacy_discovery_content" l
  JOIN "discovery_content" v ON v."id" = l."id"
  WHERE l."owner_user_id" IS NULL AND (
       v."main_media_url" IS DISTINCT FROM l."main_media_url"
    OR v."caroussel_urls" IS DISTINCT FROM l."caroussel_urls"
    OR v."location_name" IS DISTINCT FROM l."location_name"
    OR v."title" IS DISTINCT FROM l."title"
    OR v."country" IS DISTINCT FROM l."country"
    OR v."city" IS DISTINCT FROM l."city"
    OR v."coordinates" IS DISTINCT FROM l."coordinates"
    OR v."is_active" IS DISTINCT FROM coalesce(l."is_active", false)
    OR v."description" IS DISTINCT FROM nullif(btrim(regexp_replace(l."description", '\*\*|__', '', 'g')), '')
    OR (CASE WHEN jsonb_typeof(v."tags") = 'object' THEN v."tags" - 'category' ELSE v."tags" END)
       IS DISTINCT FROM (CASE WHEN jsonb_typeof(l."tags") = 'object' THEN l."tags" - 'category' ELSE l."tags" END)
    OR (CASE WHEN jsonb_typeof(v."tags") = 'object' THEN v."tags"->>'category' END)
       IS DISTINCT FROM (CASE WHEN jsonb_typeof(l."tags") = 'object' THEN
         CASE l."tags"->>'category' WHEN 'activity' THEN 'activité' ELSE l."tags"->>'category' END
       END)
  );
  IF n_diff > 0 THEN
    RAISE EXCEPTION 'Catalogue : la vue discovery_content diffère de l''ancienne table pour % lieu(x)', n_diff;
  END IF;

  SELECT count(*) INTO n_diff FROM "legacy_discovery_content" l
  LEFT JOIN "place_details" pd ON pd."place_id" = l."id"
  WHERE pd."details"->'legacy' IS DISTINCT FROM to_jsonb(l);
  IF n_diff > 0 THEN
    RAISE EXCEPTION 'Catalogue : % ligne(s) d''origine absentes de place_details.details', n_diff;
  END IF;

  RAISE NOTICE 'Catalogue : vue discovery_content conforme pour % ancienne(s) ligne(s)', n_legacy;
END;
$$;
