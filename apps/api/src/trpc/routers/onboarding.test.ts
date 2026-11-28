import { describe, expect, it, vi } from 'vitest';
import type { SubmitOnboardingInput } from '../schemas/onboarding.js';

vi.mock('../../lib/email.js', () => ({ sendWaitlistConfirmation: vi.fn() }));
// CI has no .env: env.ts would exit while the router's imports load.
vi.mock('../../env.js', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgres://user:pass@localhost:1/none',
    BETTER_AUTH_SECRET: 'test-secret-0123456789',
    BETTER_AUTH_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'test',
    GOOGLE_CLIENT_SECRET: 'test',
    FRONTEND_URL: 'http://localhost:5173',
    AI_MODEL: 'google:gemini-flash-lite-latest',
    RESEND_API_KEY: 're_test',
  },
}));

const { appRouter } = await import('../router.js');

const TRIP_ID = '00000000-0000-4000-8000-000000000001';
const ME = 'user-me';
const ANSWERS: SubmitOnboardingInput = {
  landscapes: ['city'],
  vibes: ['food'],
  travelWith: ['friends'],
  climates: ['warm'],
};

/** A db holding one trip owned by `owner`, recording updates, inserts and inserted tables. */
function dbWithTrip(owner: string | null) {
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([{ id: 'new-trip' }]),
  });
  return {
    db: {
      query: {
        trip: { findFirst: vi.fn().mockResolvedValue(owner ? { userId: owner } : undefined) },
      },
      update: () => ({ set: () => ({ where: updateWhere }) }),
      insert: () => ({ values: insertValues }),
    },
    updateWhere,
    insertValues,
  };
}

const callerAs = (db: Record<string, unknown>, userId: string | null) =>
  appRouter.createCaller({ db, user: userId ? { id: userId } : null, session: null } as never);

describe('onboarding.submit with a tripId', () => {
  it("fills the host's trip instead of creating one", async () => {
    const { db, updateWhere, insertValues } = dbWithTrip(ME);
    const result = await callerAs(db, ME).onboarding.submit({ ...ANSWERS, tripId: TRIP_ID });

    expect(result.tripId).toBe(TRIP_ID);
    expect(updateWhere).toHaveBeenCalledOnce();
    // Only the onboarding answers row: no new trip.
    expect(insertValues).toHaveBeenCalledOnce();
    expect(insertValues.mock.calls[0][0]).toMatchObject({ tripId: TRIP_ID, userId: ME });
  });

  it("refuses someone else's trip", async () => {
    const { db, updateWhere } = dbWithTrip('someone-else');
    await expect(
      callerAs(db, ME).onboarding.submit({ ...ANSWERS, tripId: TRIP_ID }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(updateWhere).not.toHaveBeenCalled();
  });

  it('refuses a guest', async () => {
    const { db } = dbWithTrip(ME);
    await expect(
      callerAs(db, null).onboarding.submit({ ...ANSWERS, tripId: TRIP_ID, guestId: ME }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('creates a trip without a tripId', async () => {
    const { db, insertValues } = dbWithTrip(null);
    const result = await callerAs(db, ME).onboarding.submit(ANSWERS);
    expect(result.tripId).toBe('new-trip');
    expect(insertValues).toHaveBeenCalledTimes(2);
  });
});
