import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, boolean, index, integer, pgTable } from 'drizzle-orm/pg-core';
import { idColumn, timestamps } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable } from '@/database/index.js';

/** Password Policy — one active policy per tenant, enforced at signup/reset/change. */
export const passwordPoliciesTable = pgTable(
   'password_policies',
   {
      id: idColumn(),

      tenantId: bigint('tenant_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

      minLength: integer('min_length').default(8).notNull(),
      requireUppercase: boolean('require_uppercase').default(true).notNull(),
      requireLowercase: boolean('require_lowercase').default(true).notNull(),
      requireNumber: boolean('require_number').default(true).notNull(),
      requireSymbol: boolean('require_symbol').default(false).notNull(),
      maxAgeDays: integer('max_age_days'),
      preventReuseCount: integer('prevent_reuse_count').default(3).notNull(),
      maxFailedAttempts: integer('max_failed_attempts').default(5).notNull(),
      lockoutMinutes: integer('lockout_minutes').default(15).notNull(),

      ...timestamps(),
   },
   (t) => ({
      tenantIdx: index('password_policies_tenant_idx').on(t.tenantId),
   }),
);

export const passwordPoliciesRelations = relations(passwordPoliciesTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [passwordPoliciesTable.tenantId],
      references: [tenantsTable.id],
   }),
}));

export type PasswordPolicy = typeof passwordPoliciesTable.$inferSelect;
export type NewPasswordPolicy = typeof passwordPoliciesTable.$inferInsert;
