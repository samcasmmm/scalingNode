import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { rolesTable, permissionsTable } from '@/database/index.js';

export const rolePermissionsTable = pgTable(
   'role_permissions',
   {
      roleId: bigint('role_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => rolesTable.id, { onDelete: 'cascade' }),

      permissionId: bigint('permission_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => permissionsTable.id, { onDelete: 'cascade' }),
   },
   (t) => ({
      pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
   })
);

export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
   role: one(rolesTable, {
      fields: [rolePermissionsTable.roleId],
      references: [rolesTable.id],
   }),
   permission: one(permissionsTable, {
      fields: [rolePermissionsTable.permissionId],
      references: [permissionsTable.id],
   }),
}));

export type RolePermission = typeof rolePermissionsTable.$inferSelect;
export type NewRolePermission = typeof rolePermissionsTable.$inferInsert;
