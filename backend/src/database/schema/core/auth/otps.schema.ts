import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn } from '@/database/schema/core/_shared.columns.js';
import { otpPurposeEnum } from '@/database/schema/core/_core.enum.js';
import { usersTable } from '@/database/index.js';

/** One-Time Passwords — email/SMS OTP challenges. */
export const otpsTable = pgTable(
   'otps',
   {
      id: idColumn(),

      userId: bigint('user_id', { mode: 'number' }).references((): AnyPgColumn => usersTable.id, {
         onDelete: 'cascade',
      }),

      codeHash: varchar('code_hash', { length: 255 }).notNull(),
      purpose: otpPurposeEnum('purpose').notNull(),
      expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
      attempts: integer('attempts').default(0).notNull(),
      maxAttempts: integer('max_attempts').default(5).notNull(),
      consumedAt: timestamp('consumed_at', { mode: 'date', withTimezone: true }),
      createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => [
      index('otps_user_idx').on(t.userId),
      index('otps_purpose_idx').on(t.purpose),
   ],
);

export const otpsRelations = relations(otpsTable, ({ one }) => ({
   user: one(usersTable, {
      fields: [otpsTable.userId],
      references: [usersTable.id],
   }),
}));

export type Otp = typeof otpsTable.$inferSelect;
export type NewOtp = typeof otpsTable.$inferInsert;
