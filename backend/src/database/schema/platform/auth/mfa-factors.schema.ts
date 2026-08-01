import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import {
  idColumn,
  timestamps,
} from '@/database/schema/platform/_shared.columns.js';
import { mfaTypeEnum } from '@/database/schema/platform/_core.enum.js';
import { usersTable } from '@/database/index.js';

/** MFA Factors — TOTP secrets, WebAuthn credentials, backup codes. */
export const mfaFactorsTable = pgTable(
  'mfa_factors',
  {
    id: idColumn(),

    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

    type: mfaTypeEnum('type').notNull(),
    secret: text('secret'),
    isPrimary: boolean('is_primary').default(false).notNull(),
    verifiedAt: timestamp('verified_at', { mode: 'date', withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { mode: 'date', withTimezone: true }),

    ...timestamps(),
  },
  (t) => [index('mfa_factors_user_idx').on(t.userId)],
);

export const mfaFactorsRelations = relations(mfaFactorsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [mfaFactorsTable.userId],
    references: [usersTable.id],
  }),
}));

export type MfaFactor = typeof mfaFactorsTable.$inferSelect;
export type NewMfaFactor = typeof mfaFactorsTable.$inferInsert;
