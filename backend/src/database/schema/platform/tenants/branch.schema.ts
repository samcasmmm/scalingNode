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
} from '@/database/schema/platform/_shared.columns.js';
import { officeTypeEnum } from '@/database/schema/platform/_core.enum.js';
import {
  tenantsTable,
  organizationsTable,
  usersTable,
  departmentsTable,
  workspacesTable,
} from '@/database/index.js';

export const branchesTable = pgTable(
  'branches',
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
    type: officeTypeEnum('type').default('branch').notNull(),
    code: varchar('code', { length: 255 }),

    address: text('address'),
    city: varchar('city', { length: 255 }),
    state: varchar('state', { length: 255 }),
    zip: varchar('zip', { length: 255 }),
    country: varchar('country', { length: 255 }),
    phone: varchar('phone', { length: 255 }),
    email: varchar('email', { length: 255 }),
    website: varchar('website', { length: 255 }),

    isActive: flagColumn('is_active'),

    ...imageBaseColumns(),
    ...auditActorColumns((): AnyPgColumn => usersTable.id),

    settings: jsonb('settings').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),

    version: versionColumn(),
  },
  (table) => [
    index('branches_tenant_idx').on(table.tenantId),
    index('branches_org_idx').on(table.organizationId),
    index('branches_type_idx').on(table.type),
    index('branches_code_idx').on(table.code),
  ],
);

export const branchesRelations = relations(branchesTable, ({ one, many }) => ({
  tenant: one(tenantsTable, {
    fields: [branchesTable.tenantId],
    references: [tenantsTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [branchesTable.organizationId],
    references: [organizationsTable.id],
  }),
  departments: many(departmentsTable),
  workspaces: many(workspacesTable),
  users: many(usersTable),
}));

export type Branch = typeof branchesTable.$inferSelect;
export type NewBranch = typeof branchesTable.$inferInsert;
