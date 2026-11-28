import { schema } from '@seego/database';
import { drizzle } from 'drizzle-orm/postgres-js';
import { describe, expect, it, vi } from 'vitest';

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

describe('getTrips', () => {
  it('correlates every counter and the cover on the outer trip, by day index', async () => {
    const queries: { sql: string; params: unknown[] }[] = [];
    // Never connects: the logger records the SQL, then the mock client fails to run it.
    const db = drizzle.mock({
      schema,
      logger: { logQuery: (sql, params) => queries.push({ sql, params }) },
    });
    const caller = appRouter.createCaller({ db, user: { id: 'user-me' }, session: {} } as never);

    await expect(caller.user.getTrips()).rejects.toThrow();

    const [{ sql, params }] = queries;
    // Previously `${trip.id}` rendered as a bare "id", which Postgres rejected as ambiguous.
    expect(sql).not.toMatch(/= "id"/);
    expect(sql.match(/"trip_day"\."trip_id" = "trip"\."id"/g)).toHaveLength(4);
    expect(sql).toMatch(/select count\(\*\) from "trip_day" where/);
    expect(sql.match(/select count\(\*\) from "activity" where/g)).toHaveLength(2);
    expect(sql.match(/"activity"\."deleted_at" is null/g)).toHaveLength(3);
    expect(sql).toContain(
      'order by "trip_day"."day_index" = 0, "trip_day"."day_index", "activity"."order_index"',
    );
    // days and steps: day > 0; liked: day = 0; cover: day >= 0.
    expect(sql.match(/"trip_day"\."day_index" > \$\d+/g)).toHaveLength(2);
    expect(sql).toMatch(/"trip_day"\."day_index" = \$\d+/);
    expect(sql).toMatch(/"trip_day"\."day_index" >= \$\d+/);
    expect(params).toContain('user-me');
  });
});
