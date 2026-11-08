import type { RouterOutputs } from '@/lib/trpc';

/**
 * One city as ranked by `discovery.rankCities`. The server scores vetoed cities `-Infinity`,
 * which JSON turns into `null`: the type says so, unlike the inferred one.
 */
export type CityRank = Omit<RouterOutputs['discovery']['rankCities'][number], 'score'> & {
  score: number | null;
};

/** Cards from liked cities shown in a row before a surprise card. */
const PERSONALIZED_RUN = 2;

/**
 * Reorders places by the cities the user likes: 2 places from cities with a positive score
 * (best first), then 1 "surprise" from any other city, and so on. Surprises keep the deck
 * from turning into a filter bubble. When one group runs out, the other one continues.
 */
export function interleaveByCityRank<Place extends { city: string | null }>(
  places: readonly Place[],
  ranks: readonly CityRank[],
): Place[] {
  const scores = new Map<string, number>();
  for (const { city, score, vetoed } of ranks) {
    if (!vetoed && score !== null && score > 0) scores.set(city, score);
  }
  const scoreOf = (place: Place) => (place.city ? (scores.get(place.city) ?? 0) : 0);

  const personalized = places.filter((place) => scoreOf(place) > 0);
  personalized.sort((a, b) => scoreOf(b) - scoreOf(a));
  const surprises = places.filter((place) => scoreOf(place) === 0);

  const result: Place[] = [];
  let p = 0;
  let s = 0;
  let run = 0;
  while (p < personalized.length || s < surprises.length) {
    const takePersonalized =
      p < personalized.length && (run < PERSONALIZED_RUN || s === surprises.length);
    if (takePersonalized) {
      result.push(personalized[p++]);
      run++;
    } else {
      result.push(surprises[s++]);
      run = 0;
    }
  }
  return result;
}
