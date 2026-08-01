import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, numeric, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { invoiceStatusEnum } from '@/database/schema/core/_core.enum.js';
import { tenantsTable, subscriptionsTable } from '@/database/index.js';

/** Invoices — one per billing period per subscription. */
export const invoicesTable = pgTable(
   'invoices',
   {
      ...baseColumns(),

      tenantId: bigint('tenant_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

      subscriptionId: bigint('subscription_id', { mode: 'number' }).references(
         (): AnyPgColumn => subscriptionsTable.id,
         { onDelete: 'set null' }
      ),

      invoiceNumber: varchar('invoice_number', { length: 60 }).notNull(),
      status: invoiceStatusEnum('status').default('open').notNull(),
      subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
      tax: numeric('tax', { precision: 12, scale: 2 }).default('0').notNull(),
      total: numeric('total', { precision: 12, scale: 2 }).notNull(),
      currency: varchar('currency', { length: 10 }).default('USD').notNull(),
      dueAt: timestamp('due_at', { mode: 'date', withTimezone: true }),
      paidAt: timestamp('paid_at', { mode: 'date', withTimezone: true }),
   },
   (t) => [
      index('invoices_tenant_idx').on(t.tenantId),
      uniqueIndex('invoices_number_idx').on(t.invoiceNumber),
   ]
);

export const invoicesRelations = relations(invoicesTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [invoicesTable.tenantId],
      references: [tenantsTable.id],
   }),
   subscription: one(subscriptionsTable, {
      fields: [invoicesTable.subscriptionId],
      references: [subscriptionsTable.id],
   }),
}));

export type Invoice = typeof invoicesTable.$inferSelect;
export type NewInvoice = typeof invoicesTable.$inferInsert;
