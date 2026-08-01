import { relations } from 'drizzle-orm';
import { type AnyPgColumn, bigint, index, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { groupsTable } from '@/database/schema/core/users/groups.schema.js';
import { usersTable } from '@/database/schema/core/users/users.schema.js';

export const groupMembersTable = pgTable(
   'group_members',
   {
      groupId: bigint('group_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => groupsTable.id, { onDelete: 'cascade' }),

      userId: bigint('user_id', { mode: 'number' })
         .notNull()
         .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

      joinedAt: timestamp('joined_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
   },
   (t) => [
      primaryKey({ columns: [t.groupId, t.userId] }),
      index('group_members_group_idx').on(t.groupId),
      index('group_members_user_idx').on(t.userId),
   ]
);

export const groupMembersRelations = relations(groupMembersTable, ({ one }) => ({
   group: one(groupsTable, {
      fields: [groupMembersTable.groupId],
      references: [groupsTable.id],
   }),
   user: one(usersTable, {
      fields: [groupMembersTable.userId],
      references: [usersTable.id],
   }),
}));

export type GroupMember = typeof groupMembersTable.$inferSelect;
export type NewGroupMember = typeof groupMembersTable.$inferInsert;
