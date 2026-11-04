export type Place = { name: string; lat: number; lon: number };

/** Every route on the globe starts here. */
export const ORIGIN: Place = { name: 'Paris', lat: 48.86, lon: 2.35 };

// Same cities as the departures board.
export const DESTINATIONS: Place[] = [
  { name: 'Lisbonne', lat: 38.72, lon: -9.14 },
  { name: 'Kyoto', lat: 35.01, lon: 135.77 },
  { name: 'Marrakech', lat: 31.63, lon: -7.99 },
  { name: 'Reykjavik', lat: 64.15, lon: -21.94 },
  { name: 'Oaxaca', lat: 17.07, lon: -96.73 },
];
