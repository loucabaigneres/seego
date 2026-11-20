import {
  activeFilterCount,
  cityOptions,
  filterInspirations,
  hasActiveFilter,
  NO_FILTERS,
  toggle,
} from './filters';

type Place = { name: string; city: string | null; country: string | null; category: string | null };

const base = {
  description: null,
  aiReport: null,
  city: null as string | null,
  tags: [] as string[],
  extractedPlaces: [] as Place[],
};
const tiktokFood = {
  ...base,
  id: 'a',
  platform: 'tiktok',
  type: 'restaurant',
  city: 'Paris',
  tags: ['bistrot asiatique', 'paris'],
  createdAt: '2026-11-10T10:00:00Z',
};
const instaMixed = {
  ...base,
  id: 'b',
  platform: 'instagram',
  type: 'autre',
  description: 'L’île flottante au Petit Brochant',
  extractedPlaces: [{ name: 'Hôtel Amour', city: 'paris', country: 'France', category: 'hotel' }],
  createdAt: '2026-11-12T10:00:00Z',
};
const romeTrip = {
  ...base,
  id: 'c',
  platform: 'tiktok',
  type: 'activité',
  extractedPlaces: [
    { name: 'Colisée', city: 'Rome', country: 'Italie', category: 'activité' },
    { name: 'Da Enzo', city: 'Rome', country: 'Italie', category: 'restaurant' },
  ],
  createdAt: '2026-11-01T10:00:00Z',
};
const all = [tiktokFood, instaMixed, romeTrip];

const ids = (items: { id: string }[]) => items.map((i) => i.id);

describe('filterInspirations', () => {
  it('keeps everything, most recent first, without filters', () => {
    expect(ids(filterInspirations(all, NO_FILTERS))).toEqual(['b', 'a', 'c']);
  });

  it('sorts oldest first on demand', () => {
    expect(ids(filterInspirations(all, { ...NO_FILTERS, sort: 'oldest' }))).toEqual([
      'c',
      'a',
      'b',
    ]);
  });

  it('filters by platform', () => {
    expect(ids(filterInspirations(all, { ...NO_FILTERS, platform: 'instagram' }))).toEqual(['b']);
  });

  it('matches any picked type, on the post or one of its places', () => {
    expect(ids(filterInspirations(all, { ...NO_FILTERS, types: ['hotel'] }))).toEqual(['b']);
    expect(ids(filterInspirations(all, { ...NO_FILTERS, types: ['restaurant'] }))).toEqual([
      'a',
      'c',
    ]);
    expect(ids(filterInspirations(all, { ...NO_FILTERS, types: ['hotel', 'activité'] }))).toEqual([
      'b',
      'c',
    ]);
  });

  it('matches any picked city, ignoring case', () => {
    expect(ids(filterInspirations(all, { ...NO_FILTERS, cities: ['Paris'] }))).toEqual(['b', 'a']);
    expect(ids(filterInspirations(all, { ...NO_FILTERS, cities: ['rome', 'Paris'] }))).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('searches hashtags, text and places, without accents', () => {
    expect(ids(filterInspirations(all, { ...NO_FILTERS, query: 'asiatique' }))).toEqual(['a']);
    expect(ids(filterInspirations(all, { ...NO_FILTERS, query: 'ile flottante' }))).toEqual(['b']);
    expect(ids(filterInspirations(all, { ...NO_FILTERS, query: 'colisee' }))).toEqual(['c']);
  });

  it('combines filters', () => {
    expect(
      filterInspirations(all, {
        ...NO_FILTERS,
        platform: 'tiktok',
        cities: ['Paris'],
        types: ['hotel'],
      }),
    ).toEqual([]);
  });
});

describe('cityOptions', () => {
  it('lists cities once per inspiration, most frequent first, merging case', () => {
    expect(cityOptions(all)).toEqual(['Paris', 'Rome']);
    expect(cityOptions([romeTrip])).toEqual(['Rome']);
  });
});

describe('activeFilterCount / hasActiveFilter', () => {
  it('counts platform, types and cities, not the order', () => {
    expect(activeFilterCount({ ...NO_FILTERS, sort: 'oldest' })).toBe(0);
    expect(
      activeFilterCount({ ...NO_FILTERS, platform: 'tiktok', types: ['hotel'], cities: ['Rome'] }),
    ).toBe(3);
  });

  it('treats a blank query as no filter', () => {
    expect(hasActiveFilter({ ...NO_FILTERS, query: ' ' })).toBe(false);
    expect(hasActiveFilter({ ...NO_FILTERS, cities: ['Rome'] })).toBe(true);
  });
});

describe('toggle', () => {
  it('adds then removes', () => {
    expect(toggle(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggle(['a', 'b'], 'a')).toEqual(['b']);
  });
});
