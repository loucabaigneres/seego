import { createClient, trip } from '@seego/database';
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
const { generateInvitePayload, INVITE_CODE_LENGTH } = await import('./group.js');

const TRIP_ID = '00000000-0000-4000-8000-000000000001';
const ME = 'user-me';

// Never connects: only used to render SQL.
const sqlOnly = createClient('postgres://user:pass@localhost:1/none');

function callerWith(db: Record<string, unknown>) {
  return appRouter.createCaller({ db, user: { id: ME }, session: {} } as never);
}

/** A db whose caller has this membership (or none) on the trip. */
function dbWithMembership(role: 'owner' | 'member' | null) {
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  return {
    db: {
      query: {
        tripMembers: {
          findFirst: vi
            .fn()
            .mockResolvedValue(role ? { tripId: TRIP_ID, userId: ME, role } : undefined),
        },
      },
      delete: () => ({ where: deleteWhere }),
    },
    deleteWhere,
  };
}

describe('generateInvitePayload', () => {
  it('makes upper-case codes without look-alike characters, valid 24 h', () => {
    for (let i = 0; i < 200; i++) {
      const { inviteCode, inviteCodeExpiresAt } = generateInvitePayload();
      expect(inviteCode).toMatch(new RegExp(`^[A-HJ-NP-Z2-9]{${INVITE_CODE_LENGTH}}$`));
      expect(inviteCodeExpiresAt.getTime() - Date.now()).toBeGreaterThan(23.9 * 3600 * 1000);
    }
  });
});

describe('joinGroupTrip', () => {
  it('finds the trip whatever the case and spaces of the typed code', async () => {
    const findFirst = vi.fn().mockResolvedValue(undefined);
    const caller = callerWith({ query: { trip: { findFirst } } });

    await expect(caller.group.joinGroupTrip({ inviteCode: ' pkb-5uku ' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    const { where } = findFirst.mock.calls[0][0];
    const { sql, params } = sqlOnly.query.trip.findFirst({ where }).toSQL();
    // Both sides upper-cased: older mixed-case codes stored as "PkB-5ukU" match too.
    expect(sql).toMatch(/upper\("trip"\."invite_code"\) = \$\d/);
    expect(params).toContain('PKB-5UKU');
  });
});

describe('getGroupMembers', () => {
  it('refuses a user who is not a member of the trip', async () => {
    const { db } = dbWithMembership(null);
    await expect(callerWith(db).group.getGroupMembers({ tripId: TRIP_ID })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('leaveGroupTrip', () => {
  it('refuses the host, who must delete the trip instead', async () => {
    const { db, deleteWhere } = dbWithMembership('owner');
    await expect(callerWith(db).group.leaveGroupTrip({ tripId: TRIP_ID })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it('refuses someone who is not a member', async () => {
    const { db } = dbWithMembership(null);
    await expect(callerWith(db).group.leaveGroupTrip({ tripId: TRIP_ID })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('removes a member from the trip', async () => {
    const { db, deleteWhere } = dbWithMembership('member');
    await expect(callerWith(db).group.leaveGroupTrip({ tripId: TRIP_ID })).resolves.toEqual({
      success: true,
    });
    expect(deleteWhere).toHaveBeenCalledOnce();
  });
});

describe('saveTripToAccount', () => {
  it("only takes the caller's own trips or guest trips, never another user's", async () => {
    const where = vi.fn().mockReturnValue({ returning: async () => [] });
    const caller = callerWith({ update: () => ({ set: () => ({ where }) }) });

    await expect(caller.user.saveTripToAccount({ tripId: TRIP_ID })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    const { sql, params } = sqlOnly
      .update(trip)
      .set({ status: 'finalized' })
      .where(where.mock.calls[0][0])
      .toSQL();
    expect(sql).toContain('like');
    expect(params).toEqual(expect.arrayContaining([TRIP_ID, ME, 'guest\\_%']));
  });
});
