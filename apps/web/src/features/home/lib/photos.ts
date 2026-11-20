// Free photos under the Unsplash License, served by the Unsplash CDN (resized on the fly).
export const HOME_DESTINATIONS = [
  // Santorini, Oia at dusk
  {
    city: 'Santorin',
    country: 'Grèce',
    blurb: 'Ruelles blanches et coucher de soleil sur la caldeira',
    photo: 'photo-1570077188670-e3a8d69ac5ff',
  },
  // Lisbon, Bica funicular. Photo: Henry Ren
  {
    city: 'Lisbonne',
    country: 'Portugal',
    blurb: 'Funiculaires jaunes, azulejos et pastéis de nata',
    photo: 'photo-1697748525265-7431cba075b6',
  },
  // Rome, the Colosseum at dusk. Photo: David Köhler
  {
    city: 'Rome',
    country: 'Italie',
    blurb: 'Le Colisée à la tombée de la nuit, puis une trattoria',
    photo: 'photo-1552832230-c0197dd311b5',
  },
] as const;

/** CDN url cropped to `width` × `width * ratio`. */
export const unsplash = (id: string, width: number, ratio = 1.3) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${Math.round(width * ratio)}&q=75`;
