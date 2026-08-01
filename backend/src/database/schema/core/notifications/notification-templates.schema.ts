import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  baseColumns,
  flagColumn,
} from '@/database/schema/core/_shared.columns.js';
import { notificationChannelEnum } from '@/database/schema/core/_core.enum.js';
import { tenantsTable } from '@/database/index.js';

/** Templates — one content template per (tenant, channel, key). */
export const notificationTemplatesTable = pgTable(
  'notification_templates',
  {
    ...baseColumns(),
    tenantId: bigint('tenant_id', { mode: 'number' }).references(
      (): AnyPgColumn => tenantsTable.id,
      {
        onDelete: 'cascade',
      },
    ),
    key: varchar('key', { length: 150 }).notNull(),
    channel: notificationChannelEnum('channel').notNull(),
    subject: varchar('subject', { length: 255 }),
    body: text('body').notNull(),
    isActive: flagColumn('is_active'),
  },
  (t) => [
    uniqueIndex('notification_templates_tenant_key_channel_idx').on(
      t.tenantId,
      t.key,
      t.channel,
    ),
  ],
);

export const notificationTemplatesRelations = relations(
  notificationTemplatesTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [notificationTemplatesTable.tenantId],
      references: [tenantsTable.id],
    }),
  }),
);

export type NotificationTemplate =
  typeof notificationTemplatesTable.$inferSelect;
export type NewNotificationTemplate =
  typeof notificationTemplatesTable.$inferInsert;
