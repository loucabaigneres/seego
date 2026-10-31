import { placeCategory, placePrice, placeSubcategories } from './discovery-place';

describe('placePrice', () => {
  it('reads the price tag', () => {
    expect(placePrice({ tags: { price: ' €€ ' } })).toBe('€€');
  });

  it('returns null when the tag is missing, blank or not a string', () => {
    expect(placePrice({ tags: null })).toBeNull();
    expect(placePrice({ tags: { price: '  ' } })).toBeNull();
    expect(placePrice({ tags: { price: 3 } })).toBeNull();
  });
});

describe('placeCategory', () => {
  it('reads the category tag', () => {
    expect(placeCategory({ tags: { category: 'restaurant' } })).toBe('restaurant');
  });

  it('returns null when the tag is missing, empty or not a string', () => {
    expect(placeCategory({ tags: null })).toBeNull();
    expect(placeCategory({ tags: { category: '' } })).toBeNull();
    expect(placeCategory({ tags: { category: 42 } })).toBeNull();
  });
});

describe('placeSubcategories', () => {
  it('keeps only the non-empty strings', () => {
    expect(
      placeSubcategories({ tags: { subcategory: ['plage', 3, '', 'coucher de soleil'] } }),
    ).toEqual(['plage', 'coucher de soleil']);
  });

  it('returns an empty list when the tag is missing or not a list', () => {
    expect(placeSubcategories({ tags: null })).toEqual([]);
    expect(placeSubcategories({ tags: { subcategory: 'plage' } })).toEqual([]);
  });
});
