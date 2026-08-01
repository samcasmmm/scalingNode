import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { permissionGroupsTable, permissionsTable } from '@/database/index.js';

export const permissionGroupItemsTable = pgTable(
   'permission_group_items',
   {
      permissionGroupId: bigint('permission_group_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => permissionGroupsTable.id, { onDelete: 'cascade' }),

      permissionId: bigint('permission_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => permissionsTable.id, { onDelete: 'cascade' }),
   },
   (t) => [
      primaryKey({ columns: [t.permissionGroupId, t.permissionId] }),
   ]
);

export const permissionGroupItemsRelations = relations(permissionGroupItemsTable, ({ one }) => ({
   group: one(permissionGroupsTable, {
      fields: [permissionGroupItemsTable.permissionGroupId],
      references: [permissionGroupsTable.id],
   }),
   permission: one(permissionsTable, {
      fields: [permissionGroupItemsTable.permissionId],
      references: [permissionsTable.id],
   }),
}));

export type PermissionGroupItem = typeof permissionGroupItemsTable.$inferSelect;
export type NewPermissionGroupItem = typeof permissionGroupItemsTable.$inferInsert;
