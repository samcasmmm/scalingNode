import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { usersTable, rolesTable, branchesTable, departmentsTable } from '@/database/index.js';

/** User <-> Role assignment, optionally narrowed to a branch/department. */
export const userRolesTable = pgTable(
   'user_roles',
   {
      id: idColumn(),

      userId: bigint('user_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

      roleId: bigint('role_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => rolesTable.id, { onDelete: 'cascade' }),

      branchId: bigint('branch_id', { mode: 'number' }).references((): AnyPgColumn => branchesTable.id, {
         onDelete: 'cascade',
      }),

      departmentId: bigint('department_id', { mode: 'number' }).references((): AnyPgColumn => departmentsTable.id, {
         onDelete: 'cascade',
      }),

      createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => [
      index('user_roles_user_idx').on(t.userId),
      index('user_roles_role_idx').on(t.roleId),
   ]
);

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
   user: one(usersTable, {
      fields: [userRolesTable.userId],
      references: [usersTable.id],
   }),
   role: one(rolesTable, {
      fields: [userRolesTable.roleId],
      references: [rolesTable.id],
   }),
   branch: one(branchesTable, {
      fields: [userRolesTable.branchId],
      references: [branchesTable.id],
   }),
   department: one(departmentsTable, {
      fields: [userRolesTable.departmentId],
      references: [departmentsTable.id],
   }),
}));

export type UserRole = typeof userRolesTable.$inferSelect;
export type NewUserRole = typeof userRolesTable.$inferInsert;
