import {
  addedPlacesLabel,
  formatHashtags,
  placeLocation,
  platformLabel,
  shortUrl,
  tripLabel,
} from './inspiration';

describe('platformLabel', () => {
  it('names known platforms and falls back to "Lien"', () => {
    expect(platformLabel('tiktok')).toBe('TikTok');
    expect(platformLabel('instagram')).toBe('Instagram');
    expect(platformLabel('other')).toBe('Lien');
    expect(platformLabel(null)).toBe('Lien');
  });
});

describe('formatHashtags', () => {
  it('prefixes, trims and drops empties and duplicates', () => {
    expect(formatHashtags([' plage', '#Plage', '', '##rome', '  '])).toEqual(['#plage', '#rome']);
  });
});

describe('shortUrl', () => {
  it('drops the protocol and "www."', () => {
    expect(shortUrl('https://www.tiktok.com/@lea/video/1')).toBe('tiktok.com/@lea/video/1');
  });
});

describe('placeLocation', () => {
  it('prefers the address, then city and country', () => {
    expect(placeLocation({ address: '1 rue X', city: 'Rome', country: 'Italie' })).toBe('1 rue X');
    expect(placeLocation({ address: null, city: 'Rome', country: 'Italie' })).toBe('Rome, Italie');
    expect(placeLocation({ address: null, city: null, country: null })).toBe('');
  });
});

describe('addedPlacesLabel', () => {
  it('agrees in number', () => {
    expect(addedPlacesLabel(0)).toBe('Aucun lieu ajouté');
    expect(addedPlacesLabel(1)).toBe('1 lieu ajouté');
    expect(addedPlacesLabel(3)).toBe('3 lieux ajoutés');
  });
});

describe('tripLabel', () => {
  it('falls back from title to destination to a default', () => {
    expect(tripLabel({ title: 'Été', destination: 'Rome' })).toBe('Été');
    expect(tripLabel({ title: ' ', destination: 'Rome' })).toBe('Rome');
    expect(tripLabel({ title: null, destination: null })).toBe('Voyage sans titre');
  });
});
