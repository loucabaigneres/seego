import { waitlistLeads } from '@seego/database';
import { and, count, desc, ilike, isNotNull, isNull, type SQL } from 'drizzle-orm';
import { adminProcedure, createTRPCRouter } from '../init.js';
import { listWaitlistLeadsSchema } from '../schemas/admin.js';

/** Escapes LIKE wildcards so the search term is matched literally. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export const adminRouter = createTRPCRouter({
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
