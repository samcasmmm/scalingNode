import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';
import { dataScopeTypeEnum } from '@/database/schema/core/_core.enum.js';
import { rolesTable } from '@/database/index.js';

/** Data Scope — how much data a role can see for a given module (row-level visibility). */
export const dataScopeTable = pgTable(
  'data_scopes',
  {
    ...baseColumns(),

    roleId: bigint('role_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => rolesTable.id, { onDelete: 'cascade' }),

    moduleKey: varchar('module_key', { length: 80 }).notNull(),
    scope: dataScopeTypeEnum('scope').default('own').notNull(),
  },
  (t) => [uniqueIndex('data_scopes_role_module_idx').on(t.roleId, t.moduleKey)],
);

export const dataScopeRelations = relations(dataScopeTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [dataScopeTable.roleId],
    references: [rolesTable.id],
  }),
}));

export type DataScope = typeof dataScopeTable.$inferSelect;
export type NewDataScope = typeof dataScopeTable.$inferInsert;
