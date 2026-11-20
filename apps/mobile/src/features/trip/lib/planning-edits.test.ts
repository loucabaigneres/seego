import {
  canRelocate,
  isDraftDirty,
  moveToDay,
  moveWithinDay,
  removeFromDay,
  toDraft,
  toPlanningInput,
} from './planning-edits';

const day = (id: string, ...activityIds: string[]) => ({
  id,
  activities: activityIds.map((activityId, orderIndex) => ({ id: activityId, orderIndex })),
});
const ids = (days: ReturnType<typeof day>[]) => days.map((d) => d.activities.map((a) => a.id));

describe('moveWithinDay', () => {
  const days = [day('d1', 'a', 'b', 'c'), day('d2', 'x')];

  it('swaps a place with its neighbour', () => {
    expect(ids(moveWithinDay(days, 'd1', 'a', 1))).toEqual([['b', 'a', 'c'], ['x']]);
    expect(ids(moveWithinDay(days, 'd1', 'c', -1))).toEqual([['a', 'c', 'b'], ['x']]);
  });

  it('does nothing past the ends or for an unknown place', () => {
    expect(moveWithinDay(days, 'd1', 'a', -1)).toEqual(days);
    expect(moveWithinDay(days, 'd1', 'c', 1)).toEqual(days);
    expect(moveWithinDay(days, 'd1', 'zz', 1)).toEqual(days);
  });
});

describe('moveToDay', () => {
  const days = [day('d1', 'a', 'b'), day('d2', 'x')];

  it('moves a place to the end of the other day', () => {
    expect(ids(moveToDay(days, 'd1', 'a', 'd2'))).toEqual([['b'], ['x', 'a']]);
  });

  it('does nothing for the same day, an unknown place or an unknown day', () => {
    expect(moveToDay(days, 'd1', 'a', 'd1')).toBe(days);
    expect(moveToDay(days, 'd1', 'zz', 'd2')).toBe(days);
    expect(moveToDay(days, 'd1', 'a', 'd9')).toBe(days);
  });
});

describe('removeFromDay', () => {
  it('drops the place from its day only, and can empty a day', () => {
    const days = [day('d1', 'a'), day('d2', 'a2')];
    expect(ids(removeFromDay(days, 'd1', 'a'))).toEqual([[], ['a2']]);
  });
});

describe('toDraft', () => {
  it('orders each day by orderIndex', () => {
    const saved = [
      {
        id: 'd1',
        activities: [
          { id: 'b', orderIndex: 1 },
          { id: 'a', orderIndex: 0 },
        ],
      },
    ];
    expect(toDraft(saved)[0]!.activities.map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('toPlanningInput', () => {
  it('sends every day with its places in draft order', () => {
    expect(toPlanningInput('t1', [day('d1', 'b', 'a'), day('d2')])).toEqual({
      tripId: 't1',
      days: [
        { dayId: 'd1', activityIds: ['b', 'a'] },
        { dayId: 'd2', activityIds: [] },
      ],
    });
  });
});

describe('isDraftDirty', () => {
  const saved = [day('d1', 'a', 'b'), day('d2', 'x')];

  it('is clean for a fresh draft', () => {
    expect(isDraftDirty(toDraft(saved), saved)).toBe(false);
  });

  it('detects a reorder, a move and a removal', () => {
    expect(isDraftDirty(moveWithinDay(saved, 'd1', 'a', 1), saved)).toBe(true);
    expect(isDraftDirty(moveToDay(saved, 'd1', 'a', 'd2'), saved)).toBe(true);
    expect(isDraftDirty(removeFromDay(saved, 'd2', 'x'), saved)).toBe(true);
  });
});

describe('canRelocate', () => {
  it('locks the hotel only', () => {
    expect(canRelocate({ category: 'hotel' })).toBe(false);
    expect(canRelocate({ category: 'restaurant' })).toBe(true);
    expect(canRelocate({ category: null })).toBe(true);
  });
});
