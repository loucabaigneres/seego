import { matchesSearch } from './search';

describe('matchesSearch', () => {
  it('matches everything on an empty query', () => {
    expect(matchesSearch('  ', ['Café Mirabelle'])).toBe(true);
  });

  it('ignores case and accents, both ways', () => {
    expect(matchesSearch('cafe', ['Café Mirabelle'])).toBe(true);
    expect(matchesSearch('HÔTEL', ['hotel du lac'])).toBe(true);
  });

  it('needs every word, in any field', () => {
    expect(matchesSearch('rome pizza', ['Da Enzo', 'Rome', null, '#pizza'])).toBe(true);
    expect(matchesSearch('rome sushi', ['Da Enzo', 'Rome'])).toBe(false);
  });
});
