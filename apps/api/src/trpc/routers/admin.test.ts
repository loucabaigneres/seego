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

const lead = { id: '00000000-0000-4000-8000-000000000001', email: 'a@seego.fr' };

/** Minimal chainable stand-in for the two queries `admin.waitlist.list` runs. */
function fakeDb() {
  const items = {
    where: () => items,
    orderBy: () => items,
    limit: () => items,
    offset: async () => [lead],
  };
  const counted = { where: async () => [{ total: 1 }] };
  return {
    select: (fields?: unknown) => ({ from: () => (fields ? counted : items) }),
  };
}

function callerAs(role: string | null) {
  const user = role ? { id: 'u1', email: 'admin@seego.fr', role } : null;
  return appRouter.createCaller({
    db: fakeDb(),
    user,
    session: user ? { user, session: {} } : null,
  } as never);
}

describe('admin.waitlist.list', () => {
  it('rejects anonymous callers', async () => {
    await expect(callerAs(null).admin.waitlist.list({})).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('rejects signed-in users without the admin role', async () => {
    await expect(callerAs('traveler').admin.waitlist.list({})).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('returns the leads and the total to admins', async () => {
    await expect(callerAs('admin').admin.waitlist.list({ search: 'a@' })).resolves.toEqual({
      items: [lead],
      total: 1,
    });
  });

  it('caps the page size', async () => {
    await expect(callerAs('admin').admin.waitlist.list({ pageSize: 500 })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });
});
