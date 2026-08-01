import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Activity Logs — human-readable feed ("Jane created Invoice #123"), lighter than audit logs. */
export const activityLogsTable = pgTable(
  'activity_logs',
  {
    id: idColumn(),

    tenantId: bigint('tenant_id', { mode: 'number' }).references(
      (): AnyPgColumn => tenantsTable.id,
      {
        onDelete: 'set null',
      },
    ),

    actorUserId: bigint('actor_user_id', { mode: 'number' }).references(
      (): AnyPgColumn => usersTable.id,
      {
        onDelete: 'set null',
      },
    ),

    message: text('message').notNull(),
    moduleKey: varchar('module_key', { length: 80 }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('activity_logs_tenant_idx').on(t.tenantId),
    index('activity_logs_actor_idx').on(t.actorUserId),
  ],
);

export const activityLogsRelations = relations(
  activityLogsTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [activityLogsTable.tenantId],
      references: [tenantsTable.id],
    }),
    actorUser: one(usersTable, {
      fields: [activityLogsTable.actorUserId],
      references: [usersTable.id],
    }),
  }),
);

export type ActivityLog = typeof activityLogsTable.$inferSelect;
export type NewActivityLog = typeof activityLogsTable.$inferInsert;
