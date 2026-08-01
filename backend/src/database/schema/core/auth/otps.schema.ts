import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn, timestamps } from '@/database/schema/core/_shared.columns.js';
import { otpPurposeEnum } from '@/database/schema/core/_core.enum.js';
import { usersTable } from '@/database/index.js';

/** OTPs — one-time passcodes for login/verification, channel-agnostic. */
export const otpsTable = pgTable(
   'otps',
   {
      id: idColumn(),

      userId: bigint('user_id', { mode: 'number' }).references((): AnyPgColumn => usersTable.id, {
         onDelete: 'cascade',
      }),

      destination: varchar('destination', { length: 255 }).notNull(),
      codeHash: text('code_hash').notNull(),
      purpose: otpPurposeEnum('purpose').notNull(),
      attempts: integer('attempts').default(0).notNull(),
      consumedAt: timestamp('consumed_at', { mode: 'date', withTimezone: true }),
      expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),

      ...timestamps(),
   },
   (t) => ({
      destinationIdx: index('otps_destination_idx').on(t.destination),
      userIdx: index('otps_user_idx').on(t.userId),
   }),
);

export const otpsRelations = relations(otpsTable, ({ one }) => ({
   user: one(usersTable, {
      fields: [otpsTable.userId],
      references: [usersTable.id],
   }),
}));

export type Otp = typeof otpsTable.$inferSelect;
export type NewOtp = typeof otpsTable.$inferInsert;
