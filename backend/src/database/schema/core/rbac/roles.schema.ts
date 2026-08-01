import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  index,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  baseColumns,
  flagColumn,
} from '@/database/schema/core/_shared.columns.js';
import { tenantsTable } from '@/database/index.js';

/** Roles — tenant-scoped (or system/global when tenantId is null). */
export const rolesTable = pgTable(
  'roles',
  {
    ...baseColumns(),

    tenantId: bigint('tenant_id', { mode: 'number' }).references(
      (): AnyPgColumn => tenantsTable.id,
      {
        onDelete: 'cascade',
      },
    ),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    isSystem: boolean('is_system').default(false).notNull(),
    isActive: flagColumn('is_active'),
  },
  (t) => [index('roles_tenant_idx').on(t.tenantId)],
);

export const rolesRelations = relations(rolesTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [rolesTable.tenantId],
    references: [tenantsTable.id],
  }),
}));

export type Role = typeof rolesTable.$inferSelect;
export type NewRole = typeof rolesTable.$inferInsert;
