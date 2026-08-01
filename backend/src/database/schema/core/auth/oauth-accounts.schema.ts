import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  idColumn,
  timestamps,
} from '@/database/schema/core/_shared.columns.js';
import { oauthProviderEnum } from '@/database/schema/core/_core.enum.js';
import { usersTable } from '@/database/index.js';

/** OAuth Accounts — one row per linked external identity (Google/Microsoft/Apple). */
export const oauthAccountsTable = pgTable(
  'oauth_accounts',
  {
    id: idColumn(),

    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),

    provider: oauthProviderEnum('provider').notNull(),
    providerAccountId: varchar('provider_account_id', {
      length: 255,
    }).notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }),

    ...timestamps(),
  },
  (t) => [
    index('oauth_accounts_user_idx').on(t.userId),
    uniqueIndex('oauth_accounts_provider_account_uq').on(
      t.provider,
      t.providerAccountId,
    ),
  ],
);

export const oauthAccountsRelations = relations(
  oauthAccountsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [oauthAccountsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export type OAuthAccount = typeof oauthAccountsTable.$inferSelect;
export type NewOAuthAccount = typeof oauthAccountsTable.$inferInsert;
