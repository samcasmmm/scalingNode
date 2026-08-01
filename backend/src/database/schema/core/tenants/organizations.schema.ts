import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, date, index, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { auditActorColumns, baseColumns, flagColumn, imageBaseColumns, versionColumn } from '@/database/schema/core/_shared.columns.js';
import {
   tenantsTable,
   usersTable,
   businessUnitsTable,
   branchesTable,
   departmentsTable,
   workspacesTable,
} from '@/database/index.js';

export const organizationsTable = pgTable(
   'organizations',
   {
      ...baseColumns(),

      tenantId: bigint('tenant_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

      name: varchar('name', { length: 255 }).notNull(),
      address: text('address'),
      city: varchar('city', { length: 255 }),
      state: varchar('state', { length: 255 }),
      zip: varchar('zip', { length: 255 }),
      country: varchar('country', { length: 255 }),
      phone: varchar('phone', { length: 255 }),
      email: varchar('email', { length: 255 }),
      website: varchar('website', { length: 255 }),

      legalName: varchar('legal_name', { length: 255 }),
      registrationNumber: varchar('registration_number', { length: 255 }),
      registrationDate: date('registration_date'),
      vatNumber: varchar('vat_number', { length: 255 }),
      taxId: varchar('tax_id', { length: 255 }),
      industry: varchar('industry', { length: 255 }),
      subIndustry: varchar('sub_industry', { length: 255 }),

      isActive: flagColumn('is_active'),

      ...imageBaseColumns(),
      ...auditActorColumns((): AnyPgColumn => usersTable.id),

      settings: jsonb('settings').default({}).notNull(),
      metadata: jsonb('metadata').default({}).notNull(),

      version: versionColumn(),
   },
   (table) => ({
      tenantIdx: index('organizations_tenant_idx').on(table.tenantId),
      emailIdx: index('organizations_email_idx').on(table.email),
   })
);

export const organizationsRelations = relations(organizationsTable, ({ one, many }) => ({
   tenant: one(tenantsTable, {
      fields: [organizationsTable.tenantId],
      references: [tenantsTable.id],
   }),
   businessUnits: many(businessUnitsTable),
   branches: many(branchesTable),
   departments: many(departmentsTable),
   workspaces: many(workspacesTable),
   users: many(usersTable),
}));

export type Organization = typeof organizationsTable.$inferSelect;
export type NewOrganization = typeof organizationsTable.$inferInsert;