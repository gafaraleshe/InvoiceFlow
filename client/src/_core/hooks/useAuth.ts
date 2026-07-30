import { trpc } from "@/lib/trpc";
import {
  ACTIVE_ORG_KEY,
  clearDevIdentity,
  devAuthEnabled,
  getDevIdentity,
} from "@/lib/auth";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { useCallback, useEffect } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * The signed-in-ness of the underlying provider, normalised so the rest of this
 * hook doesn't care which one is active.
 */
type SessionState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  /** Provider-native user object, surfaced as `session` for callers. */
  nativeUser: unknown;
  signOut: () => Promise<void>;
};

function useClerkSession(): SessionState {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();
  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    nativeUser: user,
    signOut: async () => {
      await signOut();
    },
  };
}

/**
 * Dev sign-in equivalent: the identity lives in localStorage, so it is
 * synchronously available and never "loading". Sign-out clears it and reloads,
 * which is enough for a local-only path and avoids a subscription just to
 * propagate a change that always ends in a redirect anyway.
 */
function useDevSession(): SessionState {
  const identity = getDevIdentity();
  return {
    isLoaded: true,
    isSignedIn: identity !== null,
    nativeUser: identity,
    signOut: async () => {
      clearDevIdentity();
      window.location.href = "/";
    },
  };
}

/**
 * Which provider is in play is fixed for the lifetime of the page (both flags
 * come from build-time env), so selecting the hook once at module load keeps
 * React's hook order stable.
 */
const useSession = devAuthEnabled ? useDevSession : useClerkSession;

/**
 * Auth state derived from the active session. When signed in, `auth.me` resolves
 * the app user + active organization from the verified bearer token.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();

  const { isLoaded, isSignedIn, nativeUser, signOut } = useSession();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: isLoaded && isSignedIn,
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
  const loading = !isLoaded || (isSignedIn && meQuery.isLoading);

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
    session: isSignedIn ? nativeUser : null,
    loading,
    isAuthenticated: Boolean(isSignedIn && user),
    error: meQuery.error ?? null,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
