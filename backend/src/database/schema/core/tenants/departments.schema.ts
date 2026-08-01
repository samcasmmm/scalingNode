import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import {
   auditActorColumns,
   baseColumns,
   flagColumn,
   versionColumn
} from '@/database/schema/core/_shared.columns.js';
import {
   tenantsTable,
   organizationsTable,
   branchesTable,
   businessUnitsTable,
   usersTable
} from '@/database/index.js';

export const departmentsTable = pgTable(
   'departments',
   {
      ...baseColumns(),

      tenantId: bigint('tenant_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

      organizationId: bigint('organization_id', { mode: 'number' }).references((): AnyPgColumn => organizationsTable.id, {
         onDelete: 'cascade',
      }),

      branchId: bigint('branch_id', { mode: 'number' }).references((): AnyPgColumn => branchesTable.id, {
         onDelete: 'set null',
      }),

      businessUnitId: bigint('business_unit_id', { mode: 'number' }).references(
         (): AnyPgColumn => businessUnitsTable.id,
         { onDelete: 'set null' },
      ),

      name: varchar('name', { length: 255 }).notNull(),
      code: varchar('code', { length: 255 }),

      parentDepartmentId: bigint('parent_department_id', { mode: 'number' }).references(
         (): AnyPgColumn => departmentsTable.id,
         { onDelete: 'set null' },
      ),

      isActive: flagColumn('is_active'),

      ...auditActorColumns((): AnyPgColumn => usersTable.id),

      version: versionColumn(),
   },
   (t) => ({
      tenantIdx: index('departments_tenant_idx').on(t.tenantId),
      orgIdx: index('departments_org_idx').on(t.organizationId),
      branchIdx: index('departments_branch_idx').on(t.branchId),
      buIdx: index('departments_business_unit_idx').on(t.businessUnitId),
      parentIdx: index('departments_parent_idx').on(t.parentDepartmentId),
      tenantCodeUq: uniqueIndex('departments_tenant_code_uq').on(t.tenantId, t.code),
   }),
);

export const departmentsRelations = relations(departmentsTable, ({ one, many }) => ({
   tenant: one(tenantsTable, {
      fields: [departmentsTable.tenantId],
      references: [tenantsTable.id],
   }),
   organization: one(organizationsTable, {
      fields: [departmentsTable.organizationId],
      references: [organizationsTable.id],
   }),
   branch: one(branchesTable, {
      fields: [departmentsTable.branchId],
      references: [branchesTable.id],
   }),
   businessUnit: one(businessUnitsTable, {
      fields: [departmentsTable.businessUnitId],
      references: [businessUnitsTable.id],
   }),
   parentDepartment: one(departmentsTable, {
      fields: [departmentsTable.parentDepartmentId],
      references: [departmentsTable.id],
      relationName: 'department_hierarchy',
   }),
   subDepartments: many(departmentsTable, {
      relationName: 'department_hierarchy',
   }),
}));

export type Department = typeof departmentsTable.$inferSelect;
export type NewDepartment = typeof departmentsTable.$inferInsert;
