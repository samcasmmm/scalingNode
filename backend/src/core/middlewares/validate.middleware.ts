import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "@/core/errors/index.js";

export type RequestSchema =
  | ZodType
  | {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
  };

/**
 * Generic zod request validator.
 *
 * Supports two usage modes:
 * 1. Single ZodType (validates req.body):
 *    validate(createUserSchema)
 * 2. Object with body, params, query parts:
 *    validate({ body: updateUserSchema, params: idParamSchema, query: pageQuerySchema })
 */
export function validate(schema: RequestSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const targetSchema =
      "safeParse" in schema && typeof schema.safeParse === "function"
        ? { body: schema as ZodType }
        : (schema as { body?: ZodType; params?: ZodType; query?: ZodType });

    const issues: { field: string; message: string }[] = [];

    const parts: Array<["body" | "params" | "query", "body" | "params" | "query"]> = [
      ["body", "body"],
      ["params", "params"],
      ["query", "query"],
    ];

    for (const [schemaKey, reqKey] of parts) {
      const partSchema = targetSchema[schemaKey];
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
