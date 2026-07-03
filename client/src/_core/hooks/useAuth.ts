import { trpc } from "@/lib/trpc";
import { ACTIVE_ORG_KEY } from "@/lib/auth";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { useCallback, useEffect } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Auth state derived from the Clerk session. When signed in, `auth.me` resolves
 * the app user + active organization from the verified bearer token.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();

  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: isLoaded && Boolean(isSignedIn),
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
    localStorage.removeItem(ACTIVE_ORG_KEY);
    utils.auth.me.setData(undefined, null);
    await signOut();
    await utils.auth.me.invalidate();
  }, [signOut, utils]);

  const user = isSignedIn ? (meQuery.data ?? null) : null;
  const loading =
    !isLoaded || (Boolean(isSignedIn) && meQuery.isLoading);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (!isLoaded) return;
    if (isSignedIn) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, isLoaded, isSignedIn]);

  return {
    user,
    session: isSignedIn ? clerkUser : null,
    loading,
    isAuthenticated: Boolean(isSignedIn && user),
    error: meQuery.error ?? null,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
