import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/**
 * Audit Logs — immutable, append-only record of who did what to which
 * entity. Written by AuditLogService, called from BaseService hooks so every
 * module (including future HRMS/CRM ones) gets this for free.
 */
export const auditLogsTable = pgTable(
   'audit_logs',
   {
      id: idColumn(),

      tenantId: bigint('tenant_id', { mode: 'number' }).references((): AnyPgColumn => tenantsTable.id, {
         onDelete: 'set null',
      }),

      actorUserId: bigint('actor_user_id', { mode: 'number' }).references((): AnyPgColumn => usersTable.id, {
         onDelete: 'set null',
      }),

      action: varchar('action', { length: 60 }).notNull(),
      entityType: varchar('entity_type', { length: 100 }).notNull(),
      entityId: varchar('entity_id', { length: 100 }),
      before: jsonb('before'),
      after: jsonb('after'),
      ipAddress: varchar('ip_address', { length: 60 }),
      userAgent: text('user_agent'),
      createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => ({
      tenantIdx: index('audit_logs_tenant_idx').on(t.tenantId),
      entityIdx: index('audit_logs_entity_idx').on(t.entityType, t.entityId),
      actorIdx: index('audit_logs_actor_idx').on(t.actorUserId),
   })
);

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [auditLogsTable.tenantId],
      references: [tenantsTable.id],
   }),
   actorUser: one(usersTable, {
      fields: [auditLogsTable.actorUserId],
      references: [usersTable.id],
   }),
}));

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type NewAuditLog = typeof auditLogsTable.$inferInsert;
