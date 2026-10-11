import { interleaveByCityRank, type CityRank } from './city-ranking';

const place = (id: string, city: string | null) => ({ id, city });
const ids = (places: { id: string }[]) => places.map((p) => p.id);

describe('interleaveByCityRank', () => {
  it('alternates 2 places from liked cities with 1 surprise', () => {
    const places = [
      place('s1', 'Lyon'),
      place('p1', 'Rome'),
      place('s2', 'Lyon'),
      place('p2', 'Rome'),
      place('p3', 'Rome'),
      place('p4', 'Rome'),
    ];
    const ranks: CityRank[] = [{ city: 'Rome', score: 2, vetoed: false }];

    expect(ids(interleaveByCityRank(places, ranks))).toEqual(['p1', 'p2', 's1', 'p3', 'p4', 's2']);
  });

  it('puts the best scored cities first', () => {
    const places = [place('a', 'Rome'), place('b', 'Porto'), place('c', 'Rome')];
    const ranks: CityRank[] = [
      { city: 'Rome', score: 1, vetoed: false },
      { city: 'Porto', score: 5, vetoed: false },
    ];

    expect(ids(interleaveByCityRank(places, ranks))).toEqual(['b', 'a', 'c']);
  });

  it('treats vetoed cities, null scores and unknown cities as surprises', () => {
    const places = [
      place('vetoed', 'Nice'),
      place('null', 'Bari'),
      place('zero', 'Lyon'),
      place('no-city', null),
      place('liked', 'Rome'),
    ];
    const ranks: CityRank[] = [
      { city: 'Nice', score: 3, vetoed: true },
      { city: 'Bari', score: null, vetoed: true },
      { city: 'Lyon', score: 0, vetoed: false },
      { city: 'Rome', score: 1, vetoed: false },
    ];

    expect(ids(interleaveByCityRank(places, ranks))).toEqual([
      'liked',
      'vetoed',
      'null',
      'zero',
      'no-city',
    ]);
  });

  it('keeps the original order when nothing is ranked', () => {
    const places = [place('a', 'Rome'), place('b', 'Porto'), place('c', 'Lyon')];
    expect(ids(interleaveByCityRank(places, []))).toEqual(['a', 'b', 'c']);
  });

  it('does not lose or duplicate any place', () => {
    const places = ['Rome', 'Porto', 'Lyon', 'Rome', 'Nice', 'Porto', 'Rome'].map((city, i) =>
      place(String(i), city),
    );
    const ranks: CityRank[] = [
      { city: 'Rome', score: 3, vetoed: false },
      { city: 'Porto', score: 1, vetoed: false },
    ];

    expect(ids(interleaveByCityRank(places, ranks)).sort()).toEqual(ids(places).sort());
  });
});
