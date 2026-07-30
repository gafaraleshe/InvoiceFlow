/**
 * Load the Umami analytics script, but only when it has actually been
 * configured. Both variables are optional — with either missing this is a no-op,
 * which is what an unconfigured local or preview environment wants.
 */
export function initAnalytics(): void {
  const endpoint = String(import.meta.env.VITE_ANALYTICS_ENDPOINT ?? "").trim();
  const websiteId = String(
    import.meta.env.VITE_ANALYTICS_WEBSITE_ID ?? ""
  ).trim();
  if (!endpoint || !websiteId) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = `${endpoint.replace(/\/+$/, "")}/umami`;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
}
