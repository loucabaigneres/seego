import type { Place } from '../components/globe/geometry';

type Stop = Place & { country: string; tagline: string };

/** The trip the hero flies through, in scroll order. */
export const STOPS: Stop[] = [
  {
    name: 'Paris',
    country: 'France',
    lat: 48.86,
    lon: 2.35,
    tagline: 'Point de départ. Tu swipes, on trace la route.',
  },
  {
    name: 'Lisbonne',
    country: 'Portugal',
    lat: 38.72,
    lon: -9.14,
    tagline: 'Tramway 28, miradouros et pastéis de nata.',
  },
  {
    name: 'Reykjavik',
    country: 'Islande',
    lat: 64.15,
    lon: -21.94,
    tagline: 'Aurores boréales et lagons qui fument.',
  },
  {
    name: 'Rome',
    country: 'Italie',
    lat: 41.9,
    lon: 12.5,
    tagline: 'Colisée, ruelles du Trastevere et gelato.',
  },
];

/** Each leg flies from one stop to the next. */
export const LEGS = STOPS.slice(1).map((stop, i): [Place, Place] => [STOPS[i], stop]);

const INTRO = 0.1; // share of the scroll spent zooming from the whole globe onto Paris
const HOLD = 0.35; // share of each leg spent parked on a stop before flying on

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (v: number) => v * v * (3 - 2 * v);

/**
 * Where the journey is for a scroll progress (0..1).
 * `leg` is the leg being flown, `travel` how far along it (0 parked at its start, 1 arrived),
 * `current` the stop the journey is closest to.
 */
export function journeyAt(progress: number) {
  const legs = STOPS.length - 1;
  const intro = clamp01(progress / INTRO);
  const position = clamp01((progress - INTRO) / (1 - INTRO)) * legs;
  const leg = Math.min(Math.floor(position), legs - 1);
  const travel = smoothstep(clamp01((position - leg - HOLD) / (1 - HOLD)));
  return { intro, leg, travel, current: travel < 0.5 ? leg : leg + 1 };
}

export function formatCoords({ lat, lon }: Place) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'O';
  return `${Math.abs(lat).toFixed(2)}° ${ns}  ${Math.abs(lon).toFixed(2)}° ${ew}`;
}
