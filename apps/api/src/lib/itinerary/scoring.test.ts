import { describe, expect, it } from 'vitest';

import { interestBonus } from './scoring.js';
import type { ItinItem } from './types.js';

function makeItem(title: string, subcategory: string[] = []): ItinItem {
  return {
    activityId: title,
    discoveryContentId: null,
    title,
    locationName: null,
    description: null,
    coordinates: null,
    lat: null,
    lng: null,
    mainMediaUrl: null,
    category: 'activity',
    price: null,
    subcategory,
    liked: false,
  };
}

describe('interestBonus', () => {
  // Every vibe the onboarding quiz can store in `trip.interests`.
  it.each([
    ['culture', makeItem('Musée du Louvre')],
    ['food', makeItem('Dégustation au marché')],
    ['outdoor', makeItem('Randonnée en forêt')],
    ['outdoor', makeItem('Kayak sur la rivière')],
    ['relax', makeItem('Spa & bien-être')],
    ['relax', makeItem('Croisière au coucher du soleil')],
    ['nightlife', makeItem('Cocktail sur un rooftop')],
  ])('gives a bonus to a %s place', (vibe, item) => {
    expect(interestBonus(item, [vibe])).toBeGreaterThan(0);
  });

  it('gives no bonus to a place that matches no chosen vibe', () => {
    expect(interestBonus(makeItem('Musée du Louvre'), ['relax', 'nightlife'])).toBe(0);
  });

  it('keeps the trip-form interest keys working', () => {
    const item = makeItem('Dégustation au marché');
    expect(interestBonus(item, ['gastronomy'])).toBe(interestBonus(item, ['food']));
  });
});
