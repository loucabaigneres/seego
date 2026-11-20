import { filterPins, pinCategories, regionFor, tripPins } from './map-pins';

const activity = (
  id: string,
  orderIndex: number,
  category: string | null,
  coordinates: string | null,
) => ({
  id,
  orderIndex,
  category,
  coordinates,
});

describe('tripPins', () => {
  it('keeps located places in planning order, day after day', () => {
    const pins = tripPins([
      {
        dayIndex: 1,
        activities: [
          activity('b', 2, 'restaurant', 'POINT(2.35 48.85)'),
          activity('a', 1, 'hotel', 'POINT(2.30 48.86)'),
        ],
      },
      { dayIndex: 2, activities: [activity('c', 1, 'activité', 'POINT(-3.7 40.4)')] },
    ]);

    expect(pins.map((pin) => [pin.id, pin.dayIndex])).toEqual([
      ['a', 1],
      ['b', 1],
      ['c', 2],
    ]);
    expect(pins[2].coordinate).toEqual({ latitude: 40.4, longitude: -3.7 });
  });

  it('leaves out places with missing or malformed coordinates', () => {
    const pins = tripPins([
      {
        dayIndex: 1,
        activities: [
          activity('a', 1, 'hotel', null),
          activity('b', 2, 'hotel', 'LINESTRING(1 2, 3 4)'),
          activity('c', 3, 'hotel', 'POINT(1 2)'),
        ],
      },
    ]);
    expect(pins.map((pin) => pin.id)).toEqual(['c']);
  });
});

describe('pinCategories', () => {
  it('lists present categories in a fixed order, unknown ones last', () => {
    const pins = [
      { category: 'musée' },
      { category: 'restaurant' },
      { category: null },
      { category: 'hotel' },
      { category: 'restaurant' },
    ];
    expect(pinCategories(pins)).toEqual(['hotel', 'restaurant', 'musée']);
  });
});

describe('filterPins', () => {
  const pins = [{ category: 'hotel' }, { category: 'restaurant' }];

  it('returns every pin without a category', () => {
    expect(filterPins(pins, null)).toBe(pins);
  });

  it('keeps the pins of the given category', () => {
    expect(filterPins(pins, 'restaurant')).toEqual([{ category: 'restaurant' }]);
  });
});

describe('regionFor', () => {
  it('is null without coordinates', () => {
    expect(regionFor([])).toBeNull();
  });

  it('centres a lone pin with a minimum zoom-out', () => {
    expect(regionFor([{ latitude: 48.85, longitude: 2.35 }])).toEqual({
      latitude: 48.85,
      longitude: 2.35,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  });

  it('frames every pin with some padding', () => {
    const region = regionFor([
      { latitude: 40, longitude: -4 },
      { latitude: 42, longitude: -2 },
    ]);
    expect(region?.latitude).toBeCloseTo(41);
    expect(region?.longitude).toBeCloseTo(-3);
    expect(region?.latitudeDelta).toBeCloseTo(2.8);
    expect(region?.longitudeDelta).toBeCloseTo(2.8);
  });
});
