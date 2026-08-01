import { relations } from 'drizzle-orm';
import {
   type AnyPgColumn,
   bigint, boolean,
   index, pgTable,
   text, varchar
} from 'drizzle-orm/pg-core';
import {
   auditActorColumns,
   baseColumns,
   versionColumn
} from '@/database/schema/core/_shared.columns.js';
import { accountStatusEnum } from '@/database/schema/core/_core.enum.js';
import {
   tenantsTable,
   organizationsTable,
   branchesTable,
   workspacesTable,
   teamMembersTable,
   groupMembersTable,
} from '@/database/index.js';

export const usersTable = pgTable(
   'users',
   {
      ...baseColumns(),

      name: varchar('name', { length: 255 }).notNull(),
      username: varchar('username', { length: 255 }).notNull().unique(),

      email: varchar('email', { length: 255 }).notNull().unique(),
      emailVerified: boolean('email_verified').default(false).notNull(),

      phone: varchar('phone', { length: 255 }).unique(),
      phoneVerified: boolean('phone_verified').default(false).notNull(),

      password: varchar('password', { length: 255 }).notNull(),
      image: text('image'),

      tenantId: bigint('tenant_id', { mode: 'number' }).references((): AnyPgColumn => tenantsTable.id, {
         onDelete: 'cascade',
      }),
      organizationId: bigint('organization_id', { mode: 'number' }).references(
         (): AnyPgColumn => organizationsTable.id,
         { onDelete: 'set null' }
      ),
      branchId: bigint('branch_id', { mode: 'number' }).references((): AnyPgColumn => branchesTable.id, {
         onDelete: 'set null',
      }),

      accountStatus: accountStatusEnum('account_status').default('pending').notNull(),
      version: versionColumn(),

      ...auditActorColumns((): AnyPgColumn => usersTable.id),
   },
   (table) => [
      index('users_tenant_idx').on(table.tenantId),
      index('users_org_idx').on(table.organizationId),
      index('users_branch_idx').on(table.branchId),
      index('users_email_idx').on(table.email),
   ]
);

export const usersRelations = relations(usersTable, ({ one, many }) => ({
   tenant: one(tenantsTable, {
      fields: [usersTable.tenantId],
      references: [tenantsTable.id],
   }),
   organization: one(organizationsTable, {
      fields: [usersTable.organizationId],
      references: [organizationsTable.id],
   }),
   branch: one(branchesTable, {
      fields: [usersTable.branchId],
      references: [branchesTable.id],
   }),
   ownedWorkspaces: many(workspacesTable),
   teamMemberships: many(teamMembersTable),
   groupMemberships: many(groupMembersTable),
}));

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;