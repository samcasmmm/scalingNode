import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  index,
  jsonb,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenantStatusEnum } from '@/database/schema/core/_core.enum.js';
import {
  auditActorColumns,
  baseColumns,
  imageBaseColumns,
  versionColumn,
} from '@/database/schema/core/_shared.columns.js';
import {
  usersTable,
  organizationsTable,
  businessUnitsTable,
  branchesTable,
  departmentsTable,
  workspacesTable,
} from '@/database/index.js';

export const tenantsTable = pgTable(
  'tenants',
  {
    ...baseColumns(),

    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    domain: varchar('domain', { length: 255 }).unique(),
    status: tenantStatusEnum('status').default('trial').notNull(),

    ...imageBaseColumns(),
    ...auditActorColumns((): AnyPgColumn => usersTable.id),

    settings: jsonb('settings').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),

    version: versionColumn(),
  },
  (table) => [
    uniqueIndex('tenant_slug_idx').on(table.slug),
    uniqueIndex('tenant_domain_idx').on(table.domain),
    index('tenant_status_idx').on(table.status),
  ],
);

export const tenantsRelations = relations(tenantsTable, ({ many }) => ({
  organizations: many(organizationsTable),
  businessUnits: many(businessUnitsTable),
  branches: many(branchesTable),
  departments: many(departmentsTable),
  workspaces: many(workspacesTable),
  users: many(usersTable),
}));

export type Tenant = typeof tenantsTable.$inferSelect;
export type NewTenant = typeof tenantsTable.$inferInsert;
