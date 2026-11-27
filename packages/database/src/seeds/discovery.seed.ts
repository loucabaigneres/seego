/* eslint-disable no-console -- script de seed : la progression s'affiche en console */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { sql } from 'drizzle-orm';
import { fillCityCenters, insertLegacyPlace, type LegacyPlaceRow } from '../catalogue/write.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE_PATH = path.resolve(__dirname, '../../data.json');

type Db = ReturnType<typeof import('../index.js').createClient>;

/**
 * Export des tables du catalogue : `{ exported_at, tables: { cities: [...], places: [...] } }`,
 * chaque ligne ayant les noms de colonnes SQL (snake_case).
 */
interface CatalogueExport {
  exported_at?: string;
  tables: Partial<Record<CatalogueTable, Record<string, unknown>[]>>;
}

/** Tables importables, dans l'ordre des clés étrangères. */
const CATALOGUE_TABLES = [
  'vocabulary',
  'cities',
  'places',
  'place_details',
  'place_prices',
  'place_ai_labels',
] as const;
type CatalogueTable = (typeof CATALOGUE_TABLES)[number];

/** Tables à id `serial` : leur séquence doit repartir après les ids importés. */
const SERIAL_TABLES: CatalogueTable[] = ['cities', 'place_prices'];

function isCatalogueExport(data: unknown): data is CatalogueExport {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof (data as CatalogueExport).tables === 'object'
  );
}

/**
 * Importe `data.json` dans le catalogue. Deux formats sont acceptés :
 * - l'export des tables du catalogue (`{ tables: { ... } }`) : les lignes sont insérées telles
 *   quelles, celles dont la clé existe déjà sont ignorées ;
 * - l'ancien format `discovery_content` (tableau), avec les mêmes règles que la migration 0007 :
 *   les lieux dont l'URL existe déjà sont ignorés.
 */
export async function seedDiscoveryContent(db: Db) {
  let raw: string;

  try {
    raw = readFileSync(DATA_FILE_PATH, 'utf-8');
  } catch {
    console.warn(`⚠️  ${DATA_FILE_PATH} not found, skipping discovery content import.`);
    return;
  }

  const data: unknown = JSON.parse(raw);

  if (isCatalogueExport(data)) {
    await importCatalogueExport(db, data);
    return;
  }

  if (!Array.isArray(data)) {
    throw new Error(
      `${DATA_FILE_PATH}: format inconnu (attendu un tableau discovery_content ou { tables: { ... } }).`,
    );
  }

  const items = data as LegacyPlaceRow[];
  let inserted = 0;
  await db.transaction(async (tx) => {
    for (const item of items) {
      if (await insertLegacyPlace(tx, item)) inserted++;
    }
    await fillCityCenters(tx);
  });
  console.log(`   ${inserted} lieu(x) ajoutés au catalogue sur ${items.length}.`);
}

async function importCatalogueExport(db: Db, data: CatalogueExport) {
  const unknownTables = Object.keys(data.tables).filter(
    (t) => !(CATALOGUE_TABLES as readonly string[]).includes(t),
  );
  if (unknownTables.length > 0) {
    console.warn(`⚠️  Tables ignorées (hors catalogue) : ${unknownTables.join(', ')}.`);
  }

  await db.transaction(async (tx) => {
    for (const table of CATALOGUE_TABLES) {
      const rows = data.tables[table];
      if (!rows || rows.length === 0) continue;

      // json_populate_recordset associe chaque clé JSON à la colonne du même nom ; une colonne
      // absente de l'export est insérée à NULL (pas à sa valeur par défaut).
      const target = sql.identifier(table);
      const result = await tx.execute(sql`
        insert into ${target}
        select * from json_populate_recordset(null::${target}, ${JSON.stringify(rows)}::json)
        on conflict do nothing
      `);
      console.log(`   ${table} : ${result.count} ligne(s) ajoutée(s) sur ${rows.length}.`);
    }

    for (const table of SERIAL_TABLES) {
      await tx.execute(sql`
        select setval(pg_get_serial_sequence(${table}, 'id'), coalesce(max(id), 1))
        from ${sql.identifier(table)}
      `);
    }
  });
}
