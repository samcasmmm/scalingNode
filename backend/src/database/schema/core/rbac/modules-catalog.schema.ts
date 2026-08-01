import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from '@/database/schema/core/_shared.columns.js';

/** Modules catalog — every purchasable module in the ERP registers itself here once. */
export const modulesCatalogTable = pgTable(
   'modules_catalog',
   {
      ...baseColumns(),

      key: varchar('key', { length: 80 }).notNull(),
      name: varchar('name', { length: 150 }).notNull(),
      description: text('description'),
      isCore: boolean('is_core').default(false).notNull(),
   },
   (t) => [
      uniqueIndex('modules_catalog_key_idx').on(t.key),
   ]
);

export const modulesCatalogRelations = relations(modulesCatalogTable, () => ({}));

export type ModuleCatalog = typeof modulesCatalogTable.$inferSelect;
export type NewModuleCatalog = typeof modulesCatalogTable.$inferInsert;
