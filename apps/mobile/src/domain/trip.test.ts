import { daySummary, inPlanningOrder, plannedCount, splitTripDays, tripCoverImage } from './trip';

describe('splitTripDays', () => {
  it('separates liked places, alternative hotels and the sorted itinerary', () => {
    const days = [{ dayIndex: 2 }, { dayIndex: -1 }, { dayIndex: 0 }, { dayIndex: 1 }];
    const { likedPlaces, alternativeHotels, itinerary } = splitTripDays(days);

    expect(likedPlaces).toEqual({ dayIndex: 0 });
    expect(alternativeHotels).toEqual({ dayIndex: -1 });
    expect(itinerary.map((day) => day.dayIndex)).toEqual([1, 2]);
  });

  it('returns null sections when they are absent', () => {
    const { likedPlaces, alternativeHotels, itinerary } = splitTripDays([]);
    expect(likedPlaces).toBeNull();
    expect(alternativeHotels).toBeNull();
    expect(itinerary).toEqual([]);
  });
});

describe('daySummary', () => {
  it('counts activities and restaurants with French plurals', () => {
    const activities = [
      { category: 'activité' },
      { category: 'activité' },
      { category: 'restaurant' },
      { category: 'hotel' },
    ];
    expect(daySummary(activities)).toBe('2 activités · 1 restaurant');
  });

  it('is empty when there is nothing to count', () => {
    expect(daySummary([{ category: 'hotel' }])).toBe('');
  });
});

describe('plannedCount', () => {
  it('counts the places of every itinerary day', () => {
    expect(plannedCount([{ activities: [1, 2] }, { activities: [3] }])).toBe(3);
  });

  it('is 0 without an itinerary', () => {
    expect(plannedCount([])).toBe(0);
  });
});

describe('tripCoverImage', () => {
  const day = (...urls: (string | null)[]) => ({
    activities: urls.map((mainMediaUrl) => ({ mainMediaUrl })),
  });

  it('takes the first itinerary photo before the liked places', () => {
    expect(tripCoverImage([day(null, 'a.jpg'), day('b.jpg')], day('liked.jpg'))).toBe('a.jpg');
  });

  it('falls back to a liked place, then to null', () => {
    expect(tripCoverImage([day(null)], day(null, 'liked.jpg'))).toBe('liked.jpg');
    expect(tripCoverImage([], null)).toBeNull();
  });
});

describe('inPlanningOrder', () => {
  it('sorts by orderIndex without mutating the input', () => {
    const activities = [{ orderIndex: 2 }, { orderIndex: 0 }, { orderIndex: 1 }];
    expect(inPlanningOrder(activities).map((a) => a.orderIndex)).toEqual([0, 1, 2]);
    expect(activities[0].orderIndex).toBe(2);
  });

  it('keeps an empty day empty', () => {
    expect(inPlanningOrder([])).toEqual([]);
  });
});
