import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  idColumn,
  timestamps,
} from '@/database/schema/platform/_shared.columns.js';
import { usersTable, devicesTable } from '@/database/index.js';

/**
 * Sessions — mirrors the shape better-auth expects from its Drizzle adapter
 * (id, userId, token, expiresAt, ipAddress, userAgent) plus our own device
 * link for the Device Management requirement.
 */
export const sessionsTable = pgTable(
  'sessions',
  {
    id: idColumn(),

    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

    token: varchar('token', { length: 255 }).notNull().unique(),
    ipAddress: varchar('ip_address', { length: 60 }),
    userAgent: text('user_agent'),
    deviceId: bigint('device_id', { mode: 'number' }).references(
      (): AnyPgColumn => devicesTable.id,
      {
        onDelete: 'set null',
      },
    ),
    expiresAt: timestamp('expires_at', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    revokedAt: timestamp('revoked_at', { mode: 'date', withTimezone: true }),

    ...timestamps(),
  },
  (t) => [
    index('sessions_user_idx').on(t.userId),
    index('sessions_token_idx').on(t.token),
    index('sessions_device_idx').on(t.deviceId),
  ],
);

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
  device: one(devicesTable, {
    fields: [sessionsTable.deviceId],
    references: [devicesTable.id],
  }),
}));

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;
