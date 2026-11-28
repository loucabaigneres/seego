import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { adminRoleActionEnum } from '../enums.js';
import { user } from './auth.js';

/**
 * Audit trail of every change to the Better Auth 'admin' role (back-office or
 * `db:promote-admin` script). E-mails are copied so the history stays readable
 * after an account is deleted (the foreign keys are then set to null).
 * `actorUserId` / `actorEmail` are null when the change came from the script.
 */
export const adminRoleEvents = pgTable(
  'admin_role_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    action: adminRoleActionEnum('action').notNull(),
    targetUserId: text('target_user_id').references(() => user.id, { onDelete: 'set null' }),
    targetEmail: varchar('target_email', { length: 255 }).notNull(),
    actorUserId: text('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
    actorEmail: varchar('actor_email', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('admin_role_events_created_at_idx').on(table.createdAt)],
);
