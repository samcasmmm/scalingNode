import { relations } from 'drizzle-orm';
import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  baseColumns,
  flagColumn,
} from '@/database/schema/core/_shared.columns.js';

/** Coupons — discount codes applicable at checkout/renewal. */
export const couponsTable = pgTable(
  'coupons',
  {
    ...baseColumns(),

    code: varchar('code', { length: 60 }).notNull(),
    percentOff: integer('percent_off'),
    amountOff: numeric('amount_off', { precision: 12, scale: 2 }),
    maxRedemptions: integer('max_redemptions'),
    redemptionCount: integer('redemption_count').default(0).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }),
    isActive: flagColumn('is_active'),
  },
  (t) => [uniqueIndex('coupons_code_idx').on(t.code)],
);

export const couponsRelations = relations(couponsTable, () => ({}));

export type Coupon = typeof couponsTable.$inferSelect;
export type NewCoupon = typeof couponsTable.$inferInsert;
