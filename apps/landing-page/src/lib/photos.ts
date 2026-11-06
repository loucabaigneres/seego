// Free photos under the Unsplash License, served by the Unsplash CDN (resized on the fly).
export const PHOTOS = {
  // Lisbon, Bica funicular. Photo: Henry Ren
  lisbon: 'photo-1697748525265-7431cba075b6',
  // Rome, the Colosseum at dusk. Photo: David Köhler
  rome: 'photo-1552832230-c0197dd311b5',
  // Airplane wing above the clouds. Photo: Johny Goerend
  wing: 'photo-1593182440709-4b7b56482c55',
};

/** CDN url cropped to `width` × `width * ratio`. */
export const unsplash = (id: string, width: number, ratio = 1.6) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${Math.round(width * ratio)}&q=75`;
