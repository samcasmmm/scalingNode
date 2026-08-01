import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  index,
  pgTable,
  timestamp,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { subscriptionStatusEnum } from '@/database/schema/core/_core.enum.js';
import { tenantsTable, plansTable } from '@/database/index.js';

/** Subscriptions — a tenant's active/historical subscription to a plan. */
export const subscriptionsTable = pgTable(
  'subscriptions',
  {
    ...baseColumns(),

    tenantId: bigint('tenant_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

    planId: bigint('plan_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => plansTable.id, { onDelete: 'restrict' }),

    status: subscriptionStatusEnum('status').default('trialing').notNull(),
    startsAt: timestamp('starts_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    currentPeriodEnd: timestamp('current_period_end', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    trialEndsAt: timestamp('trial_ends_at', {
      mode: 'date',
      withTimezone: true,
    }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    cancelledAt: timestamp('cancelled_at', {
      mode: 'date',
      withTimezone: true,
    }),
  },
  (t) => [
    index('subscriptions_tenant_idx').on(t.tenantId),
    index('subscriptions_plan_idx').on(t.planId),
  ],
);

export const subscriptionsRelations = relations(
  subscriptionsTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [subscriptionsTable.tenantId],
      references: [tenantsTable.id],
    }),
    plan: one(plansTable, {
      fields: [subscriptionsTable.planId],
      references: [plansTable.id],
    }),
  }),
);

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;
