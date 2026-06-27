export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Authentication now runs through Supabase on the `/login` page. This helper is
// kept so existing call sites (marketing CTAs, redirects) resolve to it.
export const getLoginUrl = () => "/login";
