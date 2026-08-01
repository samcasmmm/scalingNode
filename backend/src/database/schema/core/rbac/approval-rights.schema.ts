import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, rolesTable, usersTable } from '@/database/index.js';

/** Approval Rights — spend/approval limits per role or user for a given process. */
export const approvalRightsTable = pgTable('approval_rights', {
  ...baseColumns(),

  tenantId: bigint('tenant_id', { mode: 'number' })
    .notNull()
    .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

  roleId: bigint('role_id', { mode: 'number' }).references(
    (): AnyPgColumn => rolesTable.id,
    {
      onDelete: 'cascade',
    },
  ),

  userId: bigint('user_id', { mode: 'number' }).references(
    (): AnyPgColumn => usersTable.id,
    {
      onDelete: 'cascade',
    },
  ),

  processKey: varchar('process_key', { length: 100 }).notNull(),
  maxAmount: varchar('max_amount', { length: 30 }),
  currency: varchar('currency', { length: 10 }).default('USD'),
});

export const approvalRightsRelations = relations(
  approvalRightsTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [approvalRightsTable.tenantId],
      references: [tenantsTable.id],
    }),
    role: one(rolesTable, {
      fields: [approvalRightsTable.roleId],
      references: [rolesTable.id],
    }),
    user: one(usersTable, {
      fields: [approvalRightsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export type ApprovalRight = typeof approvalRightsTable.$inferSelect;
export type NewApprovalRight = typeof approvalRightsTable.$inferInsert;
