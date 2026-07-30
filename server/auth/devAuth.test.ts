/**
 * Guards the dev sign-in gate.
 *
 * This module deliberately accepts an unverified, self-declared identity, so the
 * conditions under which it does that are the whole security story. These tests
 * pin them down: on by explicit opt-in only, never in production, and never
 * confusable with a Clerk token.
 *
 * `DEV_AUTH_ENABLED` is computed at module load, so each case re-imports the
 * module with a fresh registry under the environment it wants to test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DevAuthModule = typeof import("./devAuth");

/** Load devAuth.ts fresh with the given environment. */
async function loadWith(
  env: Record<string, string | undefined>
): Promise<DevAuthModule> {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return import("./devAuth");
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("dev auth gating", () => {
  it("is off by default", async () => {
    const m = await loadWith({ DEV_AUTH: undefined, NODE_ENV: "development" });
    expect(m.DEV_AUTH_ENABLED).toBe(false);
  });

  it("is on with DEV_AUTH=1 outside production", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "development" });
    expect(m.DEV_AUTH_ENABLED).toBe(true);
  });

  it("accepts the other truthy spellings", async () => {
    for (const value of ["true", "TRUE", "yes", "on", " 1 "]) {
      const m = await loadWith({ DEV_AUTH: value, NODE_ENV: "development" });
      expect(m.DEV_AUTH_ENABLED, value).toBe(true);
    }
  });

  it("ignores non-flag values", async () => {
    for (const value of ["0", "false", "off", "", "no"]) {
      const m = await loadWith({ DEV_AUTH: value, NODE_ENV: "development" });
      expect(m.DEV_AUTH_ENABLED, value).toBe(false);
    }
  });

  it("stays off in production even when DEV_AUTH is set", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "production" });
    expect(m.DEV_AUTH_ENABLED).toBe(false);
  });

  it("refuses to boot a long-running production server with DEV_AUTH set", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "production" });
    expect(() => m.assertDevAuthSafe()).toThrow(
      /must never be enabled in production/
    );
  });

  it("boots cleanly when DEV_AUTH is unset in production", async () => {
    const m = await loadWith({ DEV_AUTH: undefined, NODE_ENV: "production" });
    expect(() => m.assertDevAuthSafe()).not.toThrow();
  });

  it("flags — but does not throw on — the serverless misconfiguration", async () => {
    // The serverless entrypoint must never throw at module scope: that fails
    // every invocation including /api/health, the endpoint that diagnoses it.
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "production" });
    expect(m.DEV_AUTH_MISCONFIGURED).toBe(true);
    expect(() => m.warnIfDevAuthMisconfigured()).not.toThrow();
    // Inert either way — no dev token is accepted on this path.
    expect(m.DEV_AUTH_ENABLED).toBe(false);
  });

  it("does not flag a correctly configured process", async () => {
    for (const env of [
      { DEV_AUTH: undefined, NODE_ENV: "production" },
      { DEV_AUTH: "1", NODE_ENV: "development" },
      { DEV_AUTH: undefined, NODE_ENV: "development" },
    ]) {
      const m = await loadWith(env);
      expect(m.DEV_AUTH_MISCONFIGURED, JSON.stringify(env)).toBe(false);
    }
  });
});

describe("dev token verification", () => {
  it("round-trips an identity", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "development" });
    const token = m.encodeDevToken({
      email: "Dev@Example.com",
      name: "Dev User",
    });
    const user = m.verifyDevToken(token);
    expect(user).toEqual({
      id: m.devUserId("dev@example.com"),
      email: "dev@example.com",
      fullName: "Dev User",
    });
  });

  it("derives a stable id from the email, case-insensitively", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "development" });
    expect(m.devUserId("a@b.com")).toBe(m.devUserId("  A@B.COM "));
    expect(m.devUserId("a@b.com")).not.toBe(m.devUserId("c@d.com"));
    // Recognisable as synthetic, and never collides with a Clerk id ("user_…").
    expect(m.devUserId("a@b.com")).toMatch(/^dev_user_[0-9a-f]{24}$/);
  });

  it("rejects every token when dev auth is disabled", async () => {
    const enabled = await loadWith({ DEV_AUTH: "1", NODE_ENV: "development" });
    const token = enabled.encodeDevToken({ email: "dev@example.com" });

    const disabled = await loadWith({
      DEV_AUTH: undefined,
      NODE_ENV: "development",
    });
    expect(disabled.verifyDevToken(token)).toBeNull();

    const production = await loadWith({
      DEV_AUTH: "1",
      NODE_ENV: "production",
    });
    expect(production.verifyDevToken(token)).toBeNull();
  });

  it("rejects malformed tokens without throwing", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "development" });
    const bad = [
      undefined,
      null,
      "",
      "dev.",
      "dev.not-base64!!",
      "dev." + Buffer.from("not json").toString("base64url"),
      "dev." + Buffer.from('"a string"').toString("base64url"),
      "dev." + Buffer.from("null").toString("base64url"),
      // no email, or not an email
      "dev." + Buffer.from('{"name":"No Email"}').toString("base64url"),
      "dev." + Buffer.from('{"email":"nope"}').toString("base64url"),
      "dev." + Buffer.from('{"email":"a@b"}').toString("base64url"),
      "dev." + Buffer.from('{"email":123}').toString("base64url"),
    ];
    for (const token of bad) {
      expect(
        m.verifyDevToken(token as string | undefined),
        String(token)
      ).toBeNull();
    }
  });

  it("does not treat a Clerk-shaped token as a dev token", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "development" });
    const jwt = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.sig";
    expect(m.isDevToken(jwt)).toBe(false);
    expect(m.verifyDevToken(jwt)).toBeNull();
  });

  it("recognises the dev prefix regardless of whether it is enabled", async () => {
    const m = await loadWith({ DEV_AUTH: undefined, NODE_ENV: "development" });
    // Prefix detection is what routes a token to the right verifier; it must not
    // depend on the flag, or a dev token would be handed to Clerk instead.
    expect(m.isDevToken("dev.abc")).toBe(true);
    expect(m.isDevToken("abc")).toBe(false);
  });

  it("treats a blank name as no name", async () => {
    const m = await loadWith({ DEV_AUTH: "1", NODE_ENV: "development" });
    const token = m.encodeDevToken({ email: "dev@example.com", name: "   " });
    expect(m.verifyDevToken(token)?.fullName).toBeNull();
  });
});
