import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  integer,
  pgTable,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable } from '@/database/index.js';

/** Password Policies — configurable per-tenant password strength/expiration rules. */
export const passwordPoliciesTable = pgTable('password_policies', {
  ...baseColumns(),

  tenantId: bigint('tenant_id', { mode: 'number' }).references(
    (): AnyPgColumn => tenantsTable.id,
    {
      onDelete: 'cascade',
    },
  ),

  minLength: integer('min_length').default(12).notNull(),
  requireUppercase: boolean('require_uppercase').default(true).notNull(),
  requireLowercase: boolean('require_lowercase').default(true).notNull(),
  requireNumbers: boolean('require_numbers').default(true).notNull(),
  requireSymbols: boolean('require_symbols').default(true).notNull(),
  maxAgeDays: integer('max_age_days').default(90),
  preventReuseCount: integer('prevent_reuse_count').default(5),
});

export const passwordPoliciesRelations = relations(
  passwordPoliciesTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [passwordPoliciesTable.tenantId],
      references: [tenantsTable.id],
    }),
  }),
);

export type PasswordPolicy = typeof passwordPoliciesTable.$inferSelect;
export type NewPasswordPolicy = typeof passwordPoliciesTable.$inferInsert;
