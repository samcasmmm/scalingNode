import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, boolean, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable } from '@/database/index.js';

/** Module Access — per-tenant entitlement, flipped on by a Subscription purchase. */
export const moduleAccessTable = pgTable(
   'module_access',
   {
      ...baseColumns(),

      tenantId: bigint('tenant_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

      moduleKey: varchar('module_key', { length: 80 }).notNull(),
      isEnabled: boolean('is_enabled').default(true).notNull(),
      grantedAt: timestamp('granted_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
      expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }),
      sourceSubscriptionId: bigint('source_subscription_id', { mode: 'number' }),
   },
   (t) => ({
      tenantModuleIdx: uniqueIndex('module_access_tenant_module_idx').on(t.tenantId, t.moduleKey),
   })
);

export const moduleAccessRelations = relations(moduleAccessTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [moduleAccessTable.tenantId],
      references: [tenantsTable.id],
   }),
}));

export type ModuleAccess = typeof moduleAccessTable.$inferSelect;
export type NewModuleAccess = typeof moduleAccessTable.$inferInsert;
