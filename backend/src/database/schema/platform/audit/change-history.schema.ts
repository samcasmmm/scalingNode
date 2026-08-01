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
import { idColumn } from '@/database/schema/platform/_shared.columns.js';
import { tenantsTable, usersTable } from '@/database/index.js';

/** Change History — field-level before/after diff. */
export const changeHistoryTable = pgTable(
  'change_history',
  {
    id: idColumn(),

    tenantId: bigint('tenant_id', { mode: 'number' }).references(
      (): AnyPgColumn => tenantsTable.id,
      {
        onDelete: 'set null',
      },
    ),

    actorUserId: bigint('actor_user_id', { mode: 'number' }).references(
      (): AnyPgColumn => usersTable.id,
      {
        onDelete: 'set null',
      },
    ),

    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: varchar('entity_id', { length: 100 }).notNull(),
    fieldName: varchar('field_name', { length: 100 }).notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('change_history_tenant_idx').on(t.tenantId),
    index('change_history_entity_idx').on(t.entityType, t.entityId),
    index('change_history_actor_idx').on(t.actorUserId),
  ],
);

export const changeHistoryRelations = relations(
  changeHistoryTable,
  ({ one }) => ({
    tenant: one(tenantsTable, {
      fields: [changeHistoryTable.tenantId],
      references: [tenantsTable.id],
    }),
    actorUser: one(usersTable, {
      fields: [changeHistoryTable.actorUserId],
      references: [usersTable.id],
    }),
  }),
);

export type ChangeHistory = typeof changeHistoryTable.$inferSelect;
export type NewChangeHistory = typeof changeHistoryTable.$inferInsert;
