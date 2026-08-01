import {
  AnyPgColumn,
  bigint,
  boolean,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/** Standard primary key for every table — bigint identity, matches existing schemas (tenants, users, roles, ...). */
export const idColumn = () =>
  bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity();

/**
 * Standard audit columns. `updatedAt` uses `$onUpdate` so it actually
 * changes on every UPDATE — `defaultNow()` alone only fires on INSERT.
 */
export const timestamps = () => ({
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Soft-delete pair. Query with `isNull(table.deletedAt)` for "active
 * rows"; `isDeleted` is a denormalized flag purely so simple boolean
 * filters/indexes don't need a NULL check.
 */
export const softDelete = () => ({
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
});

/**
 * Who created/last-updated/deleted a row.
 */
export const auditActorColumns = (userIdRef: () => AnyPgColumn) => ({
  createdBy: bigint('created_by', { mode: 'number' }).references(userIdRef),
  updatedBy: bigint('updated_by', { mode: 'number' }).references(userIdRef),
  deletedBy: bigint('deleted_by', { mode: 'number' }).references(userIdRef),
});

/**
 * Optimistic-locking counter.
 */
export const versionColumn = () =>
  bigint('version', { mode: 'number' }).default(1).notNull();

/** Generic boolean flag column with a configurable name, e.g. `is_active`, `is_enabled`. */
export const flagColumn = (name = 'is_active', defaultValue = true) =>
  boolean(name).default(defaultValue).notNull();

/**
 * One-line bundle for the common case: id + timestamps + soft-delete.
 */
export const baseColumns = () => ({
  id: idColumn(),
  ...timestamps(),
  ...softDelete(),
});

export const imageBaseColumns = () => ({
  logo: text('logo'),
  icon: text('icon'),
  banner: text('banner'),
});
