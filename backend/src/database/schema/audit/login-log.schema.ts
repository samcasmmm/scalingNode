import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Login Logs — every authentication attempt, success or failure. */
export const loginLogsTable = pgTable(
   'login_logs',
   {
      id: idColumn(),

      tenantId: bigint('tenant_id', { mode: 'number' }).references((): AnyPgColumn => tenantsTable.id, {
         onDelete: 'set null',
      }),

      userId: bigint('user_id', { mode: 'number' }).references((): AnyPgColumn => usersTable.id, {
         onDelete: 'set null',
      }),

      email: varchar('email', { length: 255 }),
      success: varchar('success', { length: 10 }).notNull(),
      reason: varchar('reason', { length: 150 }),
      ipAddress: varchar('ip_address', { length: 60 }),
      userAgent: text('user_agent'),
      createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => ({
      tenantIdx: index('login_logs_tenant_idx').on(t.tenantId),
      userIdx: index('login_logs_user_idx').on(t.userId),
      emailIdx: index('login_logs_email_idx').on(t.email),
   })
);

export const loginLogsRelations = relations(loginLogsTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [loginLogsTable.tenantId],
      references: [tenantsTable.id],
   }),
   user: one(usersTable, {
      fields: [loginLogsTable.userId],
      references: [usersTable.id],
   }),
}));

export type LoginLog = typeof loginLogsTable.$inferSelect;
export type NewLoginLog = typeof loginLogsTable.$inferInsert;
