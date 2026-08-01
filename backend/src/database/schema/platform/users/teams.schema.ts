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
} from '@/database/schema/platform/_shared.columns.js';
import { tenantsTable } from '@/database/schema/platform/tenants/tenants.schema.js';
import { organizationsTable } from '@/database/schema/platform/tenants/organizations.schema.js';
import { usersTable } from '@/database/schema/platform/users/users.schema.js';
import { teamMembersTable } from '@/database/schema/platform/users/team-members.schema.js';

/** Teams — arbitrary groupings of users for collaboration / assignment. */
export const teamsTable = pgTable(
  'teams',
  {
    ...baseColumns(),

    tenantId: bigint('tenant_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => tenantsTable.id, { onDelete: 'cascade' }),

    organizationId: bigint('organization_id', { mode: 'number' }).references(
      (): AnyPgColumn => organizationsTable.id,
      { onDelete: 'set null' },
    ),

    name: varchar('name', { length: 150 }).notNull(),
    description: text('description'),

    leadUserId: bigint('lead_user_id', { mode: 'number' }).references(
      (): AnyPgColumn => usersTable.id,
      {
        onDelete: 'set null',
      },
    ),

    isActive: flagColumn('is_active'),

    ...auditActorColumns((): AnyPgColumn => usersTable.id),

    version: versionColumn(),
  },
  (t) => [
    index('teams_tenant_idx').on(t.tenantId),
    index('teams_org_idx').on(t.organizationId),
    index('teams_lead_user_idx').on(t.leadUserId),
    index('teams_name_idx').on(t.name),
  ],
);

export const teamsRelations = relations(teamsTable, ({ one, many }) => ({
  tenant: one(tenantsTable, {
    fields: [teamsTable.tenantId],
    references: [tenantsTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [teamsTable.organizationId],
    references: [organizationsTable.id],
  }),
  leadUser: one(usersTable, {
    fields: [teamsTable.leadUserId],
    references: [usersTable.id],
  }),
  members: many(teamMembersTable),
}));

export type Team = typeof teamsTable.$inferSelect;
export type NewTeam = typeof teamsTable.$inferInsert;
