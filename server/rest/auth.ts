/**
 * API-key authentication for the public REST API.
 *
 * Reads `Authorization: Bearer ifk_…`, resolves it to an org-scoped context
 * (the same shape tRPC's protectedProcedure expects) and attaches it to the
 * request. This is a separate auth path from the web session's Clerk tokens.
 */
import type { NextFunction, Request, Response } from "express";
import { resolveApiKeyContext, type ApiKeyContext } from "../db";
import { sendError } from "./errors";

export type RestRequest = Request & { apiCtx?: ApiKeyContext };

export function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, value] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) return null;
  return value.trim();
}

export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = bearerToken(req);
  if (!token) {
    return sendError(
      res,
      401,
      "unauthorized",
      "Missing API key. Send 'Authorization: Bearer ifk_...'."
    );
  }
  try {
    const ctx = await resolveApiKeyContext(token);
    if (!ctx) {
      return sendError(res, 401, "unauthorized", "Invalid or revoked API key.");
    }
    (req as RestRequest).apiCtx = ctx;
    next();
  } catch (err) {
    console.error("[rest] api-key verification failed:", err);
    return sendError(res, 500, "internal_error", "Could not verify API key.");
  }
}
