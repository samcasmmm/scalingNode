import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Temporary Access — a one-off, time-boxed permission grant outside the normal role structure. */
export const temporaryAccessTable = pgTable('temporary_access', {
  id: idColumn(),

  tenantId: bigint('tenant_id', { mode: 'number' })
    .notNull()
    .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

  permissionKey: varchar('permission_key', { length: 150 }).notNull(),
  grantedByUserId: bigint('granted_by_user_id', { mode: 'number' }).references(
    (): AnyPgColumn => usersTable.id,
    {
      onDelete: 'set null',
    },
  ),
  reason: text('reason'),
  startsAt: timestamp('starts_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  endsAt: timestamp('ends_at', { mode: 'date', withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const temporaryAccessRelations = relations(
  temporaryAccessTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [temporaryAccessTable.tenantId],
      references: [tenantsTable.id],
    }),
    user: one(usersTable, {
      fields: [temporaryAccessTable.userId],
      references: [usersTable.id],
    }),
    grantedByUser: one(usersTable, {
      fields: [temporaryAccessTable.grantedByUserId],
      references: [usersTable.id],
    }),
  }),
);

export type TemporaryAccess = typeof temporaryAccessTable.$inferSelect;
export type NewTemporaryAccess = typeof temporaryAccessTable.$inferInsert;
