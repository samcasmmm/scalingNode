import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  jsonb,
  pgTable,
  text,
} from 'drizzle-orm/pg-core';
import {
  baseColumns,
  flagColumn,
} from '@/database/schema/core/_shared.columns.js';
import { tenantsTable } from '@/database/index.js';

/** Webhooks — outbound event subscriptions a tenant configures. */
export const webhooksTable = pgTable('webhooks', {
  ...baseColumns(),

  tenantId: bigint('tenant_id', { mode: 'number' })
    .notNull()
    .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: jsonb('events').default([]),
  secret: text('secret').notNull(),
  isActive: flagColumn('is_active'),
});

export const webhooksRelations = relations(webhooksTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [webhooksTable.tenantId],
    references: [tenantsTable.id],
  }),
}));

export type Webhook = typeof webhooksTable.$inferSelect;
export type NewWebhook = typeof webhooksTable.$inferInsert;
