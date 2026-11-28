import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { fillCityCenters, insertLegacyPlace, type LegacyPlaceRow } from '../catalogue/write.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE_PATH = path.resolve(__dirname, '../../data.json');

/**
 * Importe `data.json` (ancien format `discovery_content`) dans le catalogue, avec les mêmes
 * règles que la migration 0007. Les lieux dont l'URL existe déjà sont ignorés.
 */
export async function seedDiscoveryContent(
  db: ReturnType<typeof import('../index.js').createClient>,
) {
  let raw: string;

  try {
    raw = readFileSync(DATA_FILE_PATH, 'utf-8');
  } catch {
    console.warn(`⚠️  ${DATA_FILE_PATH} not found, skipping discovery content import.`);
    return;
  }

  const items: LegacyPlaceRow[] = JSON.parse(raw);

  let inserted = 0;
  await db.transaction(async (tx) => {
    for (const item of items) {
      if (await insertLegacyPlace(tx, item)) inserted++;
    }
    await fillCityCenters(tx);
  });
  // eslint-disable-next-line no-console
  console.log(`   ${inserted} lieu(x) ajoutés au catalogue sur ${items.length}.`);
}
