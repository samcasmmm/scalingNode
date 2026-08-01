/** Returns a shallow copy of `obj` without `keys`. Used to strip sensitive/internal columns (password hashes, soft-delete flags, etc.) when building response DTOs. */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> {
  const clone = { ...obj };
  for (const key of keys) delete clone[key];
  return clone;
}

/** Returns a shallow copy of `obj` containing only `keys`. */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) if (key in obj) result[key] = obj[key];
  return result;
}

/**
 * Strips `undefined` values from an object without touching explicit
 * `null`s. Essential for PATCH/update mapping: a Drizzle `.set({...})`
 * call must never receive `{ field: undefined }` for a field the caller
 * simply didn't send, or it can clobber it depending on the driver.
 */
export function stripUndefined<T extends object>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
}
