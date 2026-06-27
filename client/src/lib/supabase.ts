import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. Uses the public anon key (safe to expose; RLS and
 * the API protect data). Falls back to a placeholder URL so importing this
 * module never throws when env vars are absent (e.g. a marketing-only build).
 */
const url =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "public-anon-key";

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const supabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

/** localStorage key holding the user's selected active organization id. */
export const ACTIVE_ORG_KEY = "invoiceflow.activeOrg";

/** Current access token + active org, for attaching to API requests. */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  const org = localStorage.getItem(ACTIVE_ORG_KEY);
  if (org) headers["x-organization-id"] = org;
  return headers;
}
