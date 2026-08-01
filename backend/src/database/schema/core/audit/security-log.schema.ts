import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Security Logs — sensitive security events. */
export const securityLogsTable = pgTable(
   'security_logs',
   {
      id: idColumn(),

      tenantId: bigint('tenant_id', { mode: 'number' }).references((): AnyPgColumn => tenantsTable.id, {
         onDelete: 'set null',
      }),

      actorUserId: bigint('actor_user_id', { mode: 'number' }).references((): AnyPgColumn => usersTable.id, {
         onDelete: 'set null',
      }),

      event: varchar('event', { length: 100 }).notNull(),
      severity: varchar('severity', { length: 20 }).default('info').notNull(),
      metadata: jsonb('metadata').default({}),
      ipAddress: varchar('ip_address', { length: 60 }),
      createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => [
      index('security_logs_tenant_idx').on(t.tenantId),
      index('security_logs_actor_idx').on(t.actorUserId),
   ]
);

export const securityLogsRelations = relations(securityLogsTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [securityLogsTable.tenantId],
      references: [tenantsTable.id],
   }),
   actorUser: one(usersTable, {
      fields: [securityLogsTable.actorUserId],
      references: [usersTable.id],
   }),
}));

export type SecurityLog = typeof securityLogsTable.$inferSelect;
export type NewSecurityLog = typeof securityLogsTable.$inferInsert;
