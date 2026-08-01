import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  auditActorColumns,
  baseColumns,
  flagColumn,
  imageBaseColumns,
  versionColumn,
} from '@/database/schema/core/_shared.columns.js';
import {
  tenantsTable,
  organizationsTable,
  usersTable,
  departmentsTable,
  workspacesTable,
} from '@/database/index.js';

export const businessUnitsTable = pgTable(
  'business_units',
  {
    ...baseColumns(),

    tenantId: bigint('tenant_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

    organizationId: bigint('organization_id', { mode: 'number' }).references(
      (): AnyPgColumn => organizationsTable.id,
      { onDelete: 'cascade' },
    ),

    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 255 }),

    address: text('address'),
    isActive: flagColumn('is_active'),

    ...imageBaseColumns(),
    ...auditActorColumns((): AnyPgColumn => usersTable.id),

    settings: jsonb('settings').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),

    version: versionColumn(),
  },
  (table) => [
    index('bu_tenant_idx').on(table.tenantId),
    index('bu_org_idx').on(table.organizationId),
    index('bu_code_idx').on(table.code),
  ],
);

export const businessUnitsRelations = relations(
  businessUnitsTable,
  ({ one, many }) => ({
    tenant: one(tenantsTable, {
      fields: [businessUnitsTable.tenantId],
      references: [tenantsTable.id],
    }),
    organization: one(organizationsTable, {
      fields: [businessUnitsTable.organizationId],
      references: [organizationsTable.id],
    }),
    departments: many(departmentsTable),
    workspaces: many(workspacesTable),
  }),
);

export type BusinessUnit = typeof businessUnitsTable.$inferSelect;
export type NewBusinessUnit = typeof businessUnitsTable.$inferInsert;
