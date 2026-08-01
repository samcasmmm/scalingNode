import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  jsonb,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  auditActorColumns,
  baseColumns,
  versionColumn,
} from '@/database/schema/platform/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Audit Logs — append-only compliance ledger of every sensitive action. */
export const auditLogsTable = pgTable(
  'audit_logs',
  {
    ...baseColumns(),

    tenantId: bigint('tenant_id', { mode: 'number' }).references(
      (): AnyPgColumn => tenantsTable.id,
      {
        onDelete: 'set null',
      },
    ),

    action: varchar('action', { length: 150 }).notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: varchar('entity_id', { length: 100 }),
    changes: jsonb('changes').default({}),
    ipAddress: varchar('ip_address', { length: 60 }),
    userAgent: varchar('user_agent', { length: 255 }),

    ...auditActorColumns((): AnyPgColumn => usersTable.id),

    version: versionColumn(),
  },
  (t) => [
    index('audit_logs_tenant_idx').on(t.tenantId),
    index('audit_logs_entity_idx').on(t.entityType, t.entityId),
    index('audit_logs_action_idx').on(t.action),
  ],
);

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [auditLogsTable.tenantId],
    references: [tenantsTable.id],
  }),
}));

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type NewAuditLog = typeof auditLogsTable.$inferInsert;
