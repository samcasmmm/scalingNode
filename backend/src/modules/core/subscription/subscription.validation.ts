import { z } from 'zod';

/**
 * Request body schema for creating Subscription.
 * Add your validation fields below.
 */
export const createSubscriptionSchema = z.object({
  // Add required/optional request fields here, e.g.:
  // name: z.string().min(1).max(150),
  // description: z.string().max(1000).optional(),
});

/**
 * Request body schema for updating Subscription (partial fields).
 */
export const updateSubscriptionSchema = createSubscriptionSchema.partial();
