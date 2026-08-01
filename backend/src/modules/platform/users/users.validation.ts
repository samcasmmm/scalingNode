import { z } from 'zod';

/**
 * Request body schema for creating Users.
 * Add your validation fields below.
 */
export const createUsersSchema = z.object({
  // Add required/optional request fields here, e.g.:
  // name: z.string().min(1).max(150),
  // description: z.string().max(1000).optional(),
});

/**
 * Request body schema for updating Users (partial fields).
 */
export const updateUsersSchema = createUsersSchema.partial();
