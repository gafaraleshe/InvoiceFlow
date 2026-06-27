import type { Express, Request, Response } from "express";

/**
 * Legacy Manus OAuth callback. Authentication now runs through Supabase Auth
 * on the client (tokens are verified as bearer JWTs in server/_core/context.ts),
 * so this endpoint is retained only to respond gracefully to stale links.
 */
export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", (_req: Request, res: Response) => {
    res.redirect(302, "/login");
  });
}
