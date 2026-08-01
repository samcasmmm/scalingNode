import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns, flagColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, usersTable, rolesTable } from '@/database/index.js';

/** Delegation — user A delegates their permission set/role to user B for a date range. */
export const delegationsTable = pgTable('delegations', {
   ...baseColumns(),

   tenantId: bigint('tenant_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

   delegatorUserId: bigint('delegator_user_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

   delegateUserId: bigint('delegate_user_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

   roleId: bigint('role_id', { mode: 'number' }).references((): AnyPgColumn => rolesTable.id, {
      onDelete: 'cascade',
   }),

   startsAt: timestamp('starts_at', { mode: 'date', withTimezone: true }).notNull(),
   endsAt: timestamp('ends_at', { mode: 'date', withTimezone: true }).notNull(),
   reason: text('reason'),
   isActive: flagColumn('is_active'),
});

export const delegationsRelations = relations(delegationsTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [delegationsTable.tenantId],
      references: [tenantsTable.id],
   }),
   delegatorUser: one(usersTable, {
      fields: [delegationsTable.delegatorUserId],
      references: [usersTable.id],
   }),
   delegateUser: one(usersTable, {
      fields: [delegationsTable.delegateUserId],
      references: [usersTable.id],
   }),
   role: one(rolesTable, {
      fields: [delegationsTable.roleId],
      references: [rolesTable.id],
   }),
}));

export type Delegation = typeof delegationsTable.$inferSelect;
export type NewDelegation = typeof delegationsTable.$inferInsert;
