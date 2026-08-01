import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  integer,
  jsonb,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  baseColumns,
  flagColumn,
} from '@/database/schema/core/_shared.columns.js';
import { tenantsTable } from '@/database/index.js';

/** Policies — ABAC-style conditional rules layered on top of RBAC. */
export const policiesTable = pgTable('policies', {
  ...baseColumns(),

  tenantId: bigint('tenant_id', { mode: 'number' }).references(
    (): AnyPgColumn => tenantsTable.id,
    {
      onDelete: 'cascade',
    },
  ),
  name: varchar('name', { length: 150 }).notNull(),
  permissionKey: varchar('permission_key', { length: 150 }).notNull(),
  effect: varchar('effect', { length: 10 }).default('allow').notNull(),
  condition: jsonb('condition').default({}),
  priority: integer('priority').default(0).notNull(),
  isActive: flagColumn('is_active'),
});

export const policiesRelations = relations(policiesTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [policiesTable.tenantId],
    references: [tenantsTable.id],
  }),
}));

export type Policy = typeof policiesTable.$inferSelect;
export type NewPolicy = typeof policiesTable.$inferInsert;
