import { z } from 'zod';

/**
 * Request body schema for creating Users.
 */
export const createUsersSchema = z.object({
  name: z.string().min(2).max(150),
  username: z.string().min(3).max(80).regex(/^[a-zA-Z0-9_.]+$/, 'Invalid username format'),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().max(30).optional(),
});

/**
 * Request body schema for updating Users (partial fields).
 */
export const updateUsersSchema = createUsersSchema.partial();
