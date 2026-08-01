import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { groupsTable, rolesTable } from '@/database/index.js';

export const groupRolesTable = pgTable(
   'group_roles',
   {
      groupId: bigint('group_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => groupsTable.id, { onDelete: 'cascade' }),

      roleId: bigint('role_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => rolesTable.id, { onDelete: 'cascade' }),
   },
   (t) => ({
      pk: primaryKey({ columns: [t.groupId, t.roleId] }),
   })
);

export const groupRolesRelations = relations(groupRolesTable, ({ one }) => ({
   group: one(groupsTable, {
      fields: [groupRolesTable.groupId],
      references: [groupsTable.id],
   }),
   role: one(rolesTable, {
      fields: [groupRolesTable.roleId],
      references: [rolesTable.id],
   }),
}));

export type GroupRole = typeof groupRolesTable.$inferSelect;
export type NewGroupRole = typeof groupRolesTable.$inferInsert;
