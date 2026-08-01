import { relations } from 'drizzle-orm';
import { pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';

/** Permissions — atomic grants, keyed 'module:action' or 'module.sub:action'. */
export const permissionsTable = pgTable(
  'permissions',
  {
    ...baseColumns(),

    moduleKey: varchar('module_key', { length: 80 }).notNull(),
    key: varchar('key', { length: 150 }).notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    description: text('description'),
  },
  (t) => [uniqueIndex('permissions_key_idx').on(t.key)],
);

export const permissionsRelations = relations(permissionsTable, () => ({}));

export type Permission = typeof permissionsTable.$inferSelect;
export type NewPermission = typeof permissionsTable.$inferInsert;
