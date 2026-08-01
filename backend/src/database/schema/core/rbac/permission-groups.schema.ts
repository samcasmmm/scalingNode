import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable } from '@/database/index.js';

/** Permission Groups — bundle permissions for easy assignment. */
export const permissionGroupsTable = pgTable('permission_groups', {
  ...baseColumns(),

  tenantId: bigint('tenant_id', { mode: 'number' }).references(
    (): AnyPgColumn => tenantsTable.id,
    {
      onDelete: 'cascade',
    },
  ),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
});

export const permissionGroupsRelations = relations(
  permissionGroupsTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [permissionGroupsTable.tenantId],
      references: [tenantsTable.id],
    }),
  }),
);

export type PermissionGroup = typeof permissionGroupsTable.$inferSelect;
export type NewPermissionGroup = typeof permissionGroupsTable.$inferInsert;
