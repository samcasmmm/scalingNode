import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  pgTable,
  primaryKey,
  timestamp,
} from 'drizzle-orm/pg-core';
import { teamsTable } from '@/database/schema/core/users/teams.schema.js';
import { usersTable } from '@/database/schema/core/users/users.schema.js';

export const teamMembersTable = pgTable(
  'team_members',
  {
    teamId: bigint('team_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => teamsTable.id, { onDelete: 'cascade' }),

    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

    joinedAt: timestamp('joined_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.teamId, t.userId] }),
    index('team_members_team_idx').on(t.teamId),
    index('team_members_user_idx').on(t.userId),
  ],
);

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [teamMembersTable.teamId],
    references: [teamsTable.id],
  }),
  user: one(usersTable, {
    fields: [teamMembersTable.userId],
    references: [usersTable.id],
  }),
}));

export type TeamMember = typeof teamMembersTable.$inferSelect;
export type NewTeamMember = typeof teamMembersTable.$inferInsert;
