import { insertLegacyPlace } from '../catalogue/write.js';
import { importedInspiration, swipes } from '../schemas/inspiration.js';

export const FAKE_USER_ID = 'user-test-123';
export const DISCOVERY_CONTENT_ID = '11111111-1111-1111-1111-111111111111';

export async function seedInspirations(db: ReturnType<typeof import('../index.js').createClient>) {
  await db
    .insert(importedInspiration)
    .values([
      {
        userId: FAKE_USER_ID,
        platform: 'tiktok',
        originalUrl: 'https://tiktok.com/@voyageur/video/123',
        extracted_location: 'Tour Eiffel, Paris',
        extracted_tags: ['paris', 'france', 'monument'],
        status: 'analyzed',
      },
    ])
    .onConflictDoNothing();

  // Le catalogue n'a pas de lieu actif sans catégorie : la Tour Eiffel est une activité.
  await insertLegacyPlace(db, {
    id: DISCOVERY_CONTENT_ID,
    url: 'https://www.tour-eiffel.fr/',
    mainMediaUrl: 'https://s3.seego.com/paris-eiffel.mp4',
    locationName: 'Tour Eiffel',
    description:
      'Le monument le plus emblématique de Paris, offrant une vue panoramique sur la capitale.',
    country: 'France',
    city: 'Paris',
    coordinates: 'POINT(2.2945 48.8584)',
    tags: { category: 'activité', subcategory: ['paris', 'must-see'] },
    isActive: true,
  });

  await db
    .insert(swipes)
    .values([
      {
        userId: FAKE_USER_ID,
        discoveryContentId: DISCOVERY_CONTENT_ID,
        direction: 'like',
      },
    ])
    .onConflictDoNothing();
}
