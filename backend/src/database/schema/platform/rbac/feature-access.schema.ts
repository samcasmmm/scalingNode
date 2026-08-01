import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/platform/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Feature Access — finer-grained flag within an already-enabled module. */
export const featureAccessTable = pgTable('feature_access', {
  ...baseColumns(),

  tenantId: bigint('tenant_id', { mode: 'number' })
    .notNull()
    .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

  userId: bigint('user_id', { mode: 'number' }).references(
    (): AnyPgColumn => usersTable.id,
    {
      onDelete: 'cascade',
    },
  ),

  featureKey: varchar('feature_key', { length: 150 }).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
});

export const featureAccessRelations = relations(
  featureAccessTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [featureAccessTable.tenantId],
      references: [tenantsTable.id],
    }),
    user: one(usersTable, {
      fields: [featureAccessTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export type FeatureAccess = typeof featureAccessTable.$inferSelect;
export type NewFeatureAccess = typeof featureAccessTable.$inferInsert;
