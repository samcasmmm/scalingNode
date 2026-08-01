import type { Table } from 'drizzle-orm';

/**
 * Pulls the SELECT-shape (`$inferSelect`) and INSERT-shape (`$inferInsert`)
 * off any Drizzle table without every mapper having to import and repeat
 * `typeof usersTable.$inferSelect` by hand. Keeping this as its own file
 * means BaseMapper doesn't care *how* the shape is derived - swap the ORM
 * out later and only this file changes.
 */
export type EntityOf<TTable extends Table> = TTable['$inferSelect'];
export type InsertOf<TTable extends Table> = TTable['$inferInsert'];

/** Utility DTO shape: every field optional, used as the default UpdateDto. */
export type PartialOf<T> = { [K in keyof T]?: T[K] };
