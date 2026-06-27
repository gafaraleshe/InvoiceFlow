import { trpc } from "@/lib/trpc";
import { supabase, ACTIVE_ORG_KEY } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Auth state derived from the Supabase session. When signed in, `auth.me`
 * resolves the app user + active organization from the verified bearer token.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      utils.auth.me.invalidate();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [utils]);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(session),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Persist the active organization so the API scopes requests correctly.
  useEffect(() => {
    if (meQuery.data?.organizationId) {
      localStorage.setItem(ACTIVE_ORG_KEY, meQuery.data.organizationId);
    }
  }, [meQuery.data?.organizationId]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(ACTIVE_ORG_KEY);
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [utils]);

  const user = session ? (meQuery.data ?? null) : null;
  const loading = sessionLoading || (Boolean(session) && meQuery.isLoading);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (session) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, session]);

  return {
    user,
    session,
    loading,
    isAuthenticated: Boolean(session && user),
    error: meQuery.error ?? null,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
