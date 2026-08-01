import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, boolean, index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn, timestamps } from '@/database/schema/core/_shared.columns.js';
import { usersTable, sessionsTable } from '@/database/index.js';

/** Devices — Device Management: known devices a user has logged in from. */
export const devicesTable = pgTable(
   'devices',
   {
      id: idColumn(),

      userId: bigint('user_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

      name: varchar('name', { length: 150 }),
      fingerprint: varchar('fingerprint', { length: 255 }).notNull(),
      platform: varchar('platform', { length: 60 }),
      lastIpAddress: varchar('last_ip_address', { length: 60 }),
      isTrusted: boolean('is_trusted').default(false).notNull(),
      lastSeenAt: timestamp('last_seen_at', { mode: 'date', withTimezone: true }).defaultNow(),
      revokedAt: timestamp('revoked_at', { mode: 'date', withTimezone: true }),

      ...timestamps(),
   },
   (t) => ({
      userIdx: index('devices_user_idx').on(t.userId),
      fingerprintIdx: index('devices_fingerprint_idx').on(t.fingerprint),
   }),
);

export const devicesRelations = relations(devicesTable, ({ one, many }) => ({
   user: one(usersTable, {
      fields: [devicesTable.userId],
      references: [usersTable.id],
   }),
   sessions: many(sessionsTable),
}));

export type Device = typeof devicesTable.$inferSelect;
export type NewDevice = typeof devicesTable.$inferInsert;
