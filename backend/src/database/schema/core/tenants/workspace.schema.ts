import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, jsonb, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { auditActorColumns, baseColumns, flagColumn, versionColumn } from '@/database/schema/core/_shared.columns.js';
import {
   tenantsTable,
   organizationsTable,
   branchesTable,
   businessUnitsTable,
   usersTable,
} from '@/database/index.js';

export const workspacesTable = pgTable(
   'workspaces',
   {
      ...baseColumns(),

      tenantId: bigint('tenant_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

      organizationId: bigint('organization_id', { mode: 'number' }).references(
         (): AnyPgColumn => organizationsTable.id,
         { onDelete: 'cascade' }
      ),

      branchId: bigint('branch_id', { mode: 'number' }).references((): AnyPgColumn => branchesTable.id, {
         onDelete: 'set null',
      }),

      businessUnitId: bigint('business_unit_id', { mode: 'number' }).references(
         (): AnyPgColumn => businessUnitsTable.id,
         { onDelete: 'set null' }
      ),

      name: varchar('name', { length: 255 }).notNull(),
      code: varchar('code', { length: 255 }),
      slug: varchar('slug', { length: 255 }).notNull(),
      ownerId: bigint('owner_id', { mode: 'number' }).references((): AnyPgColumn => usersTable.id, {
         onDelete: 'set null',
      }),
      description: text('description'),

      isActive: flagColumn('is_active'),

      ...auditActorColumns((): AnyPgColumn => usersTable.id),

      settings: jsonb('settings').default({}).notNull(),
      metadata: jsonb('metadata').default({}).notNull(),

      version: versionColumn(),
   },
   (table) => ({
      tenantSlugIdx: uniqueIndex('workspace_tenant_slug_idx').on(table.tenantId, table.slug),
      tenantIdx: index('workspaces_tenant_idx').on(table.tenantId),
      orgIdx: index('workspaces_org_idx').on(table.organizationId),
      branchIdx: index('workspaces_branch_idx').on(table.branchId),
      buIdx: index('workspaces_bu_idx').on(table.businessUnitId),
      ownerIdx: index('workspaces_owner_idx').on(table.ownerId),
   })
);

export const workspacesRelations = relations(workspacesTable, ({ one }) => ({
   tenant: one(tenantsTable, {
      fields: [workspacesTable.tenantId],
      references: [tenantsTable.id],
   }),
   organization: one(organizationsTable, {
      fields: [workspacesTable.organizationId],
      references: [organizationsTable.id],
   }),
   branch: one(branchesTable, {
      fields: [workspacesTable.branchId],
      references: [branchesTable.id],
   }),
   businessUnit: one(businessUnitsTable, {
      fields: [workspacesTable.businessUnitId],
      references: [businessUnitsTable.id],
   }),
   owner: one(usersTable, {
      fields: [workspacesTable.ownerId],
      references: [usersTable.id],
   }),
}));

export type Workspace = typeof workspacesTable.$inferSelect;
export type NewWorkspace = typeof workspacesTable.$inferInsert;
