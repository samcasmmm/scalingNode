import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  idColumn,
  timestamps,
} from '@/database/schema/core/_shared.columns.js';
import { usersTable } from '@/database/index.js';

/** Devices — Device Management requirement ("Users can view active sessions, revoke specific devices"). */
export const devicesTable = pgTable(
  'devices',
  {
    id: idColumn(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

    deviceHash: varchar('device_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 150 }),
    operatingSystem: varchar('operating_system', { length: 100 }),
    browser: varchar('browser', { length: 100 }),
    ipAddress: varchar('ip_address', { length: 60 }),
    userAgent: text('user_agent'),
    isTrusted: boolean('is_trusted').default(false).notNull(),
    lastSeenAt: timestamp('last_seen_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),

    ...timestamps(),
  },
  (t) => [
    index('devices_user_idx').on(t.userId),
    index('devices_hash_idx').on(t.deviceHash),
  ],
);

export const devicesRelations = relations(devicesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [devicesTable.userId],
    references: [usersTable.id],
  }),
}));

export type Device = typeof devicesTable.$inferSelect;
export type NewDevice = typeof devicesTable.$inferInsert;
