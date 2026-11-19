import { account, adminRoleEvents, user, waitlistLeads } from '@seego/database';
import { TRPCError } from '@trpc/server';
import { and, asc, count, desc, eq, ilike, isNotNull, isNull, type SQL } from 'drizzle-orm';
import { fromNodeHeaders } from 'better-auth/node';
import { grantRefusal, revokeRefusal } from '../../lib/adminRoles.js';
import { auth } from '../../lib/auth.js';
import { sendAdminRoleNotice } from '../../lib/email.js';
import { adminProcedure, createTRPCRouter } from '../init.js';
import type { Context } from '../context.js';
import {
  grantAdminSchema,
  listWaitlistLeadsSchema,
  lookupAdminCandidateSchema,
  revokeAdminSchema,
} from '../schemas/admin.js';

/** Escapes LIKE wildcards so the search term is matched literally. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Re-authenticates the acting admin with their password (Better Auth, fresh session read). */
async function assertPassword(ctx: Context, password: string) {
  try {
    await auth.api.verifyPassword({
      body: { password },
      headers: fromNodeHeaders(ctx.req.headers),
    });
  } catch {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Mot de passe incorrect.' });
  }
}

const candidateColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  role: user.role,
  banned: user.banned,
  createdAt: user.createdAt,
};

/** E-mails of every admin, to notify them of a role change. */
async function adminEmails(ctx: Context) {
  const rows = await ctx.db.select({ email: user.email }).from(user).where(eq(user.role, 'admin'));
  return rows.map((row) => row.email);
}

export const adminRouter = createTRPCRouter({
  admins: createTRPCRouter({
    /** Current admins and the latest role changes (audit trail). */
    list: adminProcedure.query(async ({ ctx }) => {
      const [admins, events] = await Promise.all([
        ctx.db
          .select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt })
          .from(user)
          .where(eq(user.role, 'admin'))
          .orderBy(asc(user.email)),
        ctx.db.select().from(adminRoleEvents).orderBy(desc(adminRoleEvents.createdAt)).limit(20),
      ]);
      return { admins, events };
    }),

    /**
     * Exact (never partial) lookup of the account to promote, with what the admin needs to
     * recognise it: name, sign-up date, verification and sign-in methods.
     */
    lookup: adminProcedure.input(lookupAdminCandidateSchema).query(async ({ ctx, input }) => {
      const [candidate] = await ctx.db
        .select(candidateColumns)
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);
      if (!candidate) return null;

      const providers = await ctx.db
        .select({ providerId: account.providerId })
        .from(account)
        .where(eq(account.userId, candidate.id));
      return { ...candidate, providers: providers.map((row) => row.providerId) };
    }),

    /**
     * Grants the admin role. Guarded by the acting admin's password, the e-mail typed again
     * and the account's verified e-mail; audited and notified to the account and every admin.
     */
    grant: adminProcedure.input(grantAdminSchema).mutation(async ({ ctx, input }) => {
      await assertPassword(ctx, input.password);
      const actor = ctx.user;

      const target = await ctx.db.transaction(async (tx) => {
        const [candidate] = await tx
          .select(candidateColumns)
          .from(user)
          .where(eq(user.id, input.userId))
          .for('update');
        const refusal = grantRefusal(candidate, input.confirmEmail);
        if (refusal) throw new TRPCError({ code: 'BAD_REQUEST', message: refusal });

        await tx
          .update(user)
          .set({ role: 'admin', updatedAt: new Date() })
          .where(eq(user.id, candidate.id));
        await tx.insert(adminRoleEvents).values({
          action: 'grant',
          targetUserId: candidate.id,
          targetEmail: candidate.email,
          actorUserId: actor.id,
          actorEmail: actor.email,
        });
        return candidate;
      });

      // No session cookie cache: the role applies on the account's very next request.
      void adminEmails(ctx).then((to) =>
        sendAdminRoleNotice({
          to,
          action: 'grant',
          targetEmail: target.email,
          actorEmail: actor.email,
        }),
      );
      return { id: target.id, email: target.email };
    }),

    /** Revokes the admin role (never your own, never the last admin). */
    revoke: adminProcedure.input(revokeAdminSchema).mutation(async ({ ctx, input }) => {
      await assertPassword(ctx, input.password);
      const actor = ctx.user;

      const target = await ctx.db.transaction(async (tx) => {
        // Locks every admin row so two concurrent revocations cannot remove the last admins.
        const admins = await tx
          .select({ id: user.id })
          .from(user)
          .where(eq(user.role, 'admin'))
          .for('update');
        const adminIds = admins.map((row) => row.id);
        if (!adminIds.includes(actor.id)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs.' });
        }

        const [candidate] = await tx
          .select(candidateColumns)
          .from(user)
          .where(eq(user.id, input.userId));
        const refusal = revokeRefusal(candidate, actor.id, adminIds);
        if (refusal) throw new TRPCError({ code: 'BAD_REQUEST', message: refusal });

        await tx
          .update(user)
          .set({ role: 'traveler', updatedAt: new Date() })
          .where(eq(user.id, candidate.id));
        await tx.insert(adminRoleEvents).values({
          action: 'revoke',
          targetUserId: candidate.id,
          targetEmail: candidate.email,
          actorUserId: actor.id,
          actorEmail: actor.email,
        });
        return candidate;
      });

      // The former admin is told too, then loses back-office access on their next request.
      void adminEmails(ctx).then((to) =>
        sendAdminRoleNotice({
          to: [...to, target.email],
          action: 'revoke',
          targetEmail: target.email,
          actorEmail: actor.email,
        }),
      );
      return { id: target.id, email: target.email };
    }),
  }),

  waitlist: createTRPCRouter({
    /** Paginated list of waitlist leads, newest first, with the total for the current filters. */
    list: adminProcedure.input(listWaitlistLeadsSchema).query(async ({ ctx, input }) => {
      const filters: SQL[] = [];
      if (input.search) {
        filters.push(ilike(waitlistLeads.email, `%${escapeLike(input.search)}%`));
      }
      if (input.status === 'subscribed') filters.push(isNull(waitlistLeads.unsubscribedAt));
      if (input.status === 'unsubscribed') filters.push(isNotNull(waitlistLeads.unsubscribedAt));
      const where = filters.length > 0 ? and(...filters) : undefined;

      const [items, [{ total }]] = await Promise.all([
        ctx.db
          .select()
          .from(waitlistLeads)
          .where(where)
          .orderBy(desc(waitlistLeads.createdAt), desc(waitlistLeads.id))
          .limit(input.pageSize)
          .offset((input.page - 1) * input.pageSize),
        ctx.db.select({ total: count() }).from(waitlistLeads).where(where),
      ]);

      return { items, total };
    }),
  }),
});
