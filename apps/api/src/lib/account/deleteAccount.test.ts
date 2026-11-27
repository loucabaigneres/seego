import { describe, expect, it } from 'vitest';
import { isSessionFresh, planOwnedTrips } from './deleteAccount.js';

describe('isSessionFresh', () => {
  const now = Date.UTC(2026, 0, 10, 12);
  it('accepts a session opened less than 24 h ago', () => {
    expect(isSessionFresh(new Date(now - 23 * 3600 * 1000), now)).toBe(true);
  });
  it('refuses an older one', () => {
    expect(isSessionFresh(new Date(now - 25 * 3600 * 1000), now)).toBe(false);
  });
});

const day = (n: number) => new Date(Date.UTC(2026, 0, n));

describe('planOwnedTrips', () => {
  it('deletes trips nobody else is in', () => {
    expect(planOwnedTrips([{ id: 'solo' }], [])).toEqual({ transfers: [], deletions: ['solo'] });
  });

  it('hands a group trip to the member who joined first', () => {
    const plan = planOwnedTrips(
      [{ id: 'group' }],
      [
        { tripId: 'group', userId: 'late', joinedAt: day(5) },
        { tripId: 'group', userId: 'early', joinedAt: day(2) },
      ],
    );
    expect(plan).toEqual({ transfers: [{ tripId: 'group', newOwnerId: 'early' }], deletions: [] });
  });

  it('decides trip by trip, ignoring members of other trips', () => {
    const plan = planOwnedTrips(
      [{ id: 'solo' }, { id: 'group' }],
      [{ tripId: 'group', userId: 'friend', joinedAt: day(1) }],
    );
    expect(plan).toEqual({
      transfers: [{ tripId: 'group', newOwnerId: 'friend' }],
      deletions: ['solo'],
    });
  });
});
