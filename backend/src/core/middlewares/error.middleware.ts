import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import env, { environment } from "../config/env.config.js";

interface ErrorShape {
   statusCode: number;
   errorCode: string;
   message: string;
   extra: Record<string, unknown>;
   isOperational: boolean;
}


// Postgres error codes worth surfacing distinctly (Drizzle throws these raw)
const PG_ERROR_MAP: Record<string, Partial<ErrorShape>> = {
   "23505": { statusCode: 409, errorCode: "UNIQUE_VIOLATION", message: "Resource already exists" },
   "23503": { statusCode: 409, errorCode: "FK_VIOLATION", message: "Related resource not found" },
   "23502": { statusCode: 400, errorCode: "NOT_NULL_VIOLATION", message: "Missing required field" },
   "22P02": { statusCode: 400, errorCode: "INVALID_INPUT", message: "Malformed input value" },
};

function resolveError(err: unknown): ErrorShape {
   const base: ErrorShape = {
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      message: "Something went wrong",
      extra: {},
      isOperational: false,
   };

   if (err && typeof err === "object") {
      const anyErr = err as any;
      if (typeof anyErr.statusCode === "number") {
         return {
            statusCode: anyErr.statusCode,
            errorCode: anyErr.errorCode || anyErr.code || "HTTP_ERROR",
            message: anyErr.message || base.message,
            extra: anyErr.extra ?? {},
            isOperational: anyErr.isOperational ?? true,
         };
      }
   }

   if (err instanceof ZodError) {
      return {
         statusCode: 422,
         errorCode: "VALIDATION_ERROR",
         message: "Validation failed",
         extra: { issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
         isOperational: true,
      };
   }

   // Raw pg / Drizzle driver error (has a `.code` string like '23505')
   if (err && typeof err === "object" && "code" in err && typeof (err as any).code === "string") {
      const mapped = PG_ERROR_MAP[(err as any).code];
      if (mapped) {
         return { ...base, ...mapped, isOperational: true } as ErrorShape;
      }
   }

   if (err instanceof SyntaxError && "body" in (err as any)) {
      return { statusCode: 400, errorCode: "MALFORMED_JSON", message: "Malformed request body", extra: {}, isOperational: true };
   }

   if (err instanceof Error) {
      return {
         ...base,
         message: environment.PRODUCTION ? base.message : err.message,
         isOperational: false,
      };
   }

   return base;
}

export const errorHandlerMiddleware = (
   err: unknown,
   req: Request,
   res: Response,
   _next: NextFunction,
): void => {
   const resolved = resolveError(err);
   const requestId = (req as any).id ?? req.headers["x-request-id"];

   const logPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      statusCode: resolved.statusCode,
      errorCode: resolved.errorCode,
      isOperational: resolved.isOperational,
      stack: err instanceof Error ? err.stack : undefined,
   };

   if (resolved.isOperational) {
      req.log ? req.log.warn(logPayload, "Request failed") : console.warn("Request failed", logPayload);
   } else {
      req.log ? req.log.error(logPayload, "Unexpected error") : console.error("Unexpected error", logPayload);
   }

   res.status(resolved.statusCode).json({
      success: false,
      statusCode: resolved.statusCode,
      errorCode: resolved.errorCode,
      message: resolved.message,
      ...(Object.keys(resolved.extra).length > 0 ? { extra: resolved.extra } : {}),
      requestId,
      ...(environment.PRODUCTION ? {} : { stack: err instanceof Error ? err.stack : undefined }),
   });
};
