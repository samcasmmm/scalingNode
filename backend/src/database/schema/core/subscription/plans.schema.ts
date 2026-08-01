import { relations } from 'drizzle-orm';
import { integer, jsonb, numeric, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { baseColumns, flagColumn } from '@/database/schema/core/_shared.columns.js';

/** Plans — sellable packages; `moduleKeys` is what actually drives Module Access on purchase. */
export const plansTable = pgTable(
   'plans',
   {
      ...baseColumns(),

      name: varchar('name', { length: 150 }).notNull(),
      code: varchar('code', { length: 60 }).notNull(),
      description: text('description'),
      moduleKeys: jsonb('module_keys').default([]),
      price: numeric('price', { precision: 12, scale: 2 }).notNull(),
      currency: varchar('currency', { length: 10 }).default('USD').notNull(),
      billingCycle: varchar('billing_cycle', { length: 20 }).default('monthly').notNull(),
      trialDays: integer('trial_days').default(0).notNull(),
      isActive: flagColumn('is_active'),
   },
   (t) => [
      uniqueIndex('plans_code_idx').on(t.code),
   ]
);

export const plansRelations = relations(plansTable, () => ({}));

export type Plan = typeof plansTable.$inferSelect;
export type NewPlan = typeof plansTable.$inferInsert;
