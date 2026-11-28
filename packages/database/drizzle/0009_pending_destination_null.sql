-- Group trips without a city kept a placeholder label as destination; it is now null.
UPDATE "trip" SET "destination" = NULL WHERE "destination" IN ('Destination à définir', 'Nouvelle aventure');
