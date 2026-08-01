import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  numeric,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { paymentStatusEnum } from '@/database/schema/core/_core.enum.js';
import { tenantsTable, invoicesTable } from '@/database/index.js';

/** Payments — settlement attempts against an invoice. */
export const paymentsTable = pgTable(
  'payments',
  {
    ...baseColumns(),

    tenantId: bigint('tenant_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

    invoiceId: bigint('invoice_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => invoicesTable.id, { onDelete: 'cascade' }),

    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    status: paymentStatusEnum('status').default('pending').notNull(),
    method: varchar('method', { length: 40 }),
    gatewayReference: varchar('gateway_reference', { length: 150 }),
  },
  (t) => [
    index('payments_tenant_idx').on(t.tenantId),
    index('payments_invoice_idx').on(t.invoiceId),
  ],
);

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [paymentsTable.tenantId],
    references: [tenantsTable.id],
  }),
  invoice: one(invoicesTable, {
    fields: [paymentsTable.invoiceId],
    references: [invoicesTable.id],
  }),
}));

export type Payment = typeof paymentsTable.$inferSelect;
export type NewPayment = typeof paymentsTable.$inferInsert;
