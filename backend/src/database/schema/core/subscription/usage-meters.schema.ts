import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, numeric, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, subscriptionsTable } from '@/database/index.js';

/** Usage Meter — metered consumption per tenant for usage-based billing. */
export const usageMetersTable = pgTable(
   'usage_meters',
   {
      id: idColumn(),

      tenantId: bigint('tenant_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

      subscriptionId: bigint('subscription_id', { mode: 'number' }).references(
         (): AnyPgColumn => subscriptionsTable.id,
         { onDelete: 'cascade' }
      ),

      metricKey: varchar('metric_key', { length: 80 }).notNull(),
      quantity: numeric('quantity', { precision: 14, scale: 2 }).default('0').notNull(),
      periodStart: timestamp('period_start', { mode: 'date', withTimezone: true }).notNull(),
      periodEnd: timestamp('period_end', { mode: 'date', withTimezone: true }).notNull(),
      recordedAt: timestamp('recorded_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => [
      index('usage_meters_tenant_metric_idx').on(t.tenantId, t.metricKey),
   ]
);

export const usageMetersRelations = relations(usageMetersTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [usageMetersTable.tenantId],
      references: [tenantsTable.id],
   }),
   subscription: one(subscriptionsTable, {
      fields: [usageMetersTable.subscriptionId],
      references: [subscriptionsTable.id],
   }),
}));

export type UsageMeter = typeof usageMetersTable.$inferSelect;
export type NewUsageMeter = typeof usageMetersTable.$inferInsert;
