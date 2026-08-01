import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, boolean, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { idColumn, timestamps } from '@/database/schema/core/_shared.columns.js';
import { mfaTypeEnum } from '@/database/schema/core/_core.enum.js';
import { usersTable } from '@/database/index.js';

/** MFA factors enrolled per user. */
export const mfaFactorsTable = pgTable(
   'mfa_factors',
   {
      id: idColumn(),

      userId: bigint('user_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

      type: mfaTypeEnum('type').notNull(),
      secret: text('secret'),
      isVerified: boolean('is_verified').default(false).notNull(),
      isPrimary: boolean('is_primary').default(false).notNull(),
      recoveryCodes: jsonb('recovery_codes').default([]),

      ...timestamps(),
   },
   (t) => ({
      userIdx: index('mfa_factors_user_idx').on(t.userId),
   }),
);

export const mfaFactorsRelations = relations(mfaFactorsTable, ({ one }) => ({
   user: one(usersTable, {
      fields: [mfaFactorsTable.userId],
      references: [usersTable.id],
   }),
}));

export type MfaFactor = typeof mfaFactorsTable.$inferSelect;
export type NewMfaFactor = typeof mfaFactorsTable.$inferInsert;
