/**
 * Host-based routing for the Hermite Labs family.
 *
 * The same deployment serves two brands:
 *   - hermitelabs.com / www.hermitelabs.com → the Hermite Labs parent site
 *   - flow.hermitelabs.com (and everything else) → the Hermite Flow product
 *
 * On any host you can force the parent site with `/labs` or `?labs=1` — handy
 * for previews and local dev where the hostname is `localhost`.
 */
export function isLabsHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname;
  if (path === "/labs") return true;
  if (new URLSearchParams(window.location.search).get("labs") === "1")
    return true;
  return host === "hermitelabs.com" || host === "www.hermitelabs.com";
}

/** Absolute URL to the Hermite Flow app (used from the parent site). */
export const FLOW_URL = "https://flow.hermitelabs.com";
/** Absolute URL to the Hermite Labs parent site. */
export const LABS_URL = "https://hermitelabs.com";
