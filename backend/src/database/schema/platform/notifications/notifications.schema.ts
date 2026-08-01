import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/platform/_shared.columns.js';
import {
  notificationChannelEnum,
  notificationStatusEnum,
} from '@/database/schema/platform/_core.enum.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Notification Log — every dispatched notification, across every channel. */
export const notificationsTable = pgTable(
  'notifications',
  {
    id: idColumn(),

    tenantId: bigint('tenant_id', { mode: 'number' }).references(
      (): AnyPgColumn => tenantsTable.id,
      {
        onDelete: 'cascade',
      },
    ),
    userId: bigint('user_id', { mode: 'number' }).references(
      (): AnyPgColumn => usersTable.id,
      {
        onDelete: 'cascade',
      },
    ),
    channel: notificationChannelEnum('channel').notNull(),
    templateKey: varchar('template_key', { length: 150 }),
    title: varchar('title', { length: 255 }),
    body: text('body').notNull(),
    data: jsonb('data').default({}),
    status: notificationStatusEnum('status').default('queued').notNull(),
    readAt: timestamp('read_at', { mode: 'date', withTimezone: true }),
    sentAt: timestamp('sent_at', { mode: 'date', withTimezone: true }),
    failReason: text('fail_reason'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('notifications_user_idx').on(t.userId),
    index('notifications_tenant_idx').on(t.tenantId),
  ],
);

export const notificationsRelations = relations(
  notificationsTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [notificationsTable.tenantId],
      references: [tenantsTable.id],
    }),
    user: one(usersTable, {
      fields: [notificationsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export type NotificationLog = typeof notificationsTable.$inferSelect;
export type NewNotificationLog = typeof notificationsTable.$inferInsert;
