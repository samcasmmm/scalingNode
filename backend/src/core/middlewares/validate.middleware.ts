import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "@/core/errors/index.js";

interface RequestSchema {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/**
 * Generic zod request validator.
 *
 * Two usage modes:
 *   validate({ body: createUserSchema })
 *   validate({ body: updateUserSchema, params: idParamSchema, query: pageQuerySchema })
 *
 * Each provided part is validated independently and written back to `req`
 * so downstream handlers see coerced/transformed values (e.g. z.coerce.number()
 * on a query param), not the raw strings Express parsed off the wire.
 */
export function validate(schema: RequestSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const issues: { field: string; message: string }[] = [];

    const parts: Array<[keyof RequestSchema, "body" | "params" | "query"]> = [
      ["body", "body"],
      ["params", "params"],
      ["query", "query"],
    ];

    for (const [schemaKey, reqKey] of parts) {
      const partSchema = schema[schemaKey];
      if (!partSchema) continue;

      const result = partSchema.safeParse(req[reqKey]);
      if (!result.success) {
        issues.push(
          ...result.error.issues.map((issue) => ({
            field: [reqKey, ...issue.path].join("."),
            message: issue.message,
          })),
        );
        continue;
      }

      // req.query/req.params are getters on some Express versions —
      // reassign rather than mutate in place to avoid silently no-op'ing.
      (req as any)[reqKey] = result.data;
    }

    if (issues.length > 0) {
      return next(new ValidationError("Validation failed", issues));
    }

    next();
  };
}