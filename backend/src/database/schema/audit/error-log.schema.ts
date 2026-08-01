import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Error Logs — application errors captured for support/debugging (separate from infra logs/Sentry). */
export const errorLogsTable = pgTable(
   'error_logs',
   {
      id: idColumn(),

      tenantId: bigint('tenant_id', { mode: 'number' }).references((): AnyPgColumn => tenantsTable.id, {
         onDelete: 'set null',
      }),

      userId: bigint('user_id', { mode: 'number' }).references((): AnyPgColumn => usersTable.id, {
         onDelete: 'set null',
      }),

      message: text('message').notNull(),
      stack: text('stack'),
      path: varchar('path', { length: 255 }),
      statusCode: varchar('status_code', { length: 10 }),
      createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => ({
      tenantIdx: index('error_logs_tenant_idx').on(t.tenantId),
      userIdx: index('error_logs_user_idx').on(t.userId),
   })
);

export const errorLogsRelations = relations(errorLogsTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [errorLogsTable.tenantId],
      references: [tenantsTable.id],
   }),
   user: one(usersTable, {
      fields: [errorLogsTable.userId],
      references: [usersTable.id],
   }),
}));

export type ErrorLog = typeof errorLogsTable.$inferSelect;
export type NewErrorLog = typeof errorLogsTable.$inferInsert;
