/**
 * REST error handling: maps tRPC/Zod errors onto HTTP status codes and the
 * documented `{ error: { code, message, details? } }` JSON shape.
 */
import { TRPCError } from "@trpc/server";
import type { Response } from "express";
import { ZodError } from "zod";

const TRPC_STATUS: Record<string, number> = {
  PARSE_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 409,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const TRPC_CODE: Record<string, string> = {
  PARSE_ERROR: "validation_error",
  BAD_REQUEST: "validation_error",
  UNPROCESSABLE_CONTENT: "validation_error",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  PRECONDITION_FAILED: "conflict",
  TOO_MANY_REQUESTS: "rate_limited",
  INTERNAL_SERVER_ERROR: "internal_error",
};

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  res
    .status(status)
    .json({ error: { code, message, ...(details ? { details } : {}) } });
}

/** Turn any thrown error into a consistent REST error response. */
export function handleError(res: Response, err: unknown) {
  if (err instanceof TRPCError) {
    const status = TRPC_STATUS[err.code] ?? 500;
    const code = TRPC_CODE[err.code] ?? "internal_error";
    // tRPC wraps Zod input errors as BAD_REQUEST with a ZodError cause.
    const details =
      err.cause instanceof ZodError ? err.cause.issues : undefined;
    return sendError(res, status, code, err.message, details);
  }
  if (err instanceof ZodError) {
    return sendError(res, 400, "validation_error", "Invalid request", err.issues);
  }
  console.error("[rest] unexpected error:", err);
  return sendError(res, 500, "internal_error", "Internal server error");
}
