import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/platform/_shared.columns.js';
import { webhooksTable } from '@/database/index.js';

/** Webhook Deliveries — attempt log per event fired to a webhook. */
export const webhookDeliveriesTable = pgTable(
  'webhook_deliveries',
  {
    id: idColumn(),

    webhookId: bigint('webhook_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => webhooksTable.id, { onDelete: 'cascade' }),
    event: varchar('event', { length: 150 }).notNull(),
    payload: jsonb('payload').default({}),
    responseStatus: varchar('response_status', { length: 10 }),
    attempt: varchar('attempt', { length: 10 }).default('1'),
    deliveredAt: timestamp('delivered_at', {
      mode: 'date',
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('webhook_deliveries_webhook_idx').on(t.webhookId)],
);

export const webhookDeliveriesRelations = relations(
  webhookDeliveriesTable,
  ({ one }) => ({
    webhook: one(webhooksTable, {
      fields: [webhookDeliveriesTable.webhookId],
      references: [webhooksTable.id],
    }),
  }),
);

export type WebhookDelivery = typeof webhookDeliveriesTable.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveriesTable.$inferInsert;
