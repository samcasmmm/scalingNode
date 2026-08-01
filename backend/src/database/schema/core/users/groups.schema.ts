import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  auditActorColumns,
  baseColumns,
  flagColumn,
  versionColumn,
} from '@/database/schema/core/_shared.columns.js';
import {
  tenantsTable,
  usersTable,
  groupMembersTable,
} from '@/database/index.js';

/** Groups — used primarily for RBAC role assignment at scale (assign a role to a group, not per-user). */
export const groupsTable = pgTable(
  'groups',
  {
    ...baseColumns(),

    tenantId: bigint('tenant_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

    name: varchar('name', { length: 150 }).notNull(),
    description: text('description'),

    isActive: flagColumn('is_active'),

    ...auditActorColumns((): AnyPgColumn => usersTable.id),

    version: versionColumn(),
  },
  (t) => [
    index('groups_tenant_idx').on(t.tenantId),
    index('groups_name_idx').on(t.name),
  ],
);

export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
  tenant: one(tenantsTable, {
    fields: [groupsTable.tenantId],
    references: [tenantsTable.id],
  }),
  members: many(groupMembersTable),
}));

export type Group = typeof groupsTable.$inferSelect;
export type NewGroup = typeof groupsTable.$inferInsert;
