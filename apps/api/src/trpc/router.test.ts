import { createClient, trip } from '@seego/database';
import { eq } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/email.js', () => ({ sendWaitlistConfirmation: vi.fn() }));
// CI has no .env: env.ts would exit while the router's imports load.
vi.mock('../env.js', () => ({
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

const { appRouter } = await import('./router.js');

const TRIP_ID = '00000000-0000-4000-8000-000000000001';
const form = {
  destination: 'Lisbonne',
  startDate: '2026-12-01',
  durationDays: 3,
  numberOfPeople: 2,
  ages: [30, 31],
  intensity: 'balanced' as const,
  averagePrice: 'mid' as const,
};

/** Runs `submitTripConfiguration` on an existing trip and returns what it passed to `.set()`. */
async function submitUpdate(input: Record<string, unknown>) {
  const set = vi.fn().mockReturnValue({
    where: () => ({ returning: async () => [{ id: TRIP_ID }] }),
  });
  const db = { update: () => ({ set }) };
  const caller = appRouter.createCaller({ db, user: null, session: null } as never);
  await caller.submitTripConfiguration({ ...form, tripId: TRIP_ID, ...input } as never);
  return set.mock.calls[0][0] as Record<string, unknown>;
}

// Never connects: only used to render SQL.
const sqlOnly = createClient('postgres://user:pass@localhost:1/none');

describe('submitTripConfiguration', () => {
  it('keeps the quiz-seeded trip.interests when the form sends none', async () => {
    const values = await submitUpdate({});
    const { sql } = sqlOnly.update(trip).set(values).where(eq(trip.id, TRIP_ID)).toSQL();
    expect(sql).not.toContain('"interests"');
    expect(sql).toContain('"destination"');
  });

  it('overwrites trip.interests when the form sends some', async () => {
    const values = await submitUpdate({ interests: ['culture'] });
    expect(values.interests).toEqual(['culture']);
  });
});
