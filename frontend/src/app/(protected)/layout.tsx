"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { Spinner } from "@/components/ui/spinner";
import { AppShell } from "@/components/layout/app-shell";
import { useSubscription } from "@/hooks/use-billing";

// Pages exempt from subscription gate
const SUBSCRIPTION_EXEMPT = ["/onboarding", "/settings/billing"];

function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("hasSession=1"));
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: subscriptionData, isLoading: subLoading } = useSubscription();
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tracks whether the initial session-check attempt has completed
  const [sessionChecked, setSessionChecked] = useState(false);

  // On mount: if no in-memory access token, attempt silent refresh via httpOnly cookie
  useEffect(() => {
    if (accessToken) {
      // Already authenticated (navigating between protected pages)
      setSessionChecked(true);
      return;
    }

    if (!hasSessionCookie()) {
      // No session cookie — definitely not logged in
      setSessionChecked(true);
      return;
    }

    // hasSession cookie present but no in-memory token (page refresh) — try silent refresh
    authApi
      .refreshToken()
      .then((data) => {
        setTokens(data as never);
        setSessionChecked(true);
      })
      .catch(() => {
        clearAuth();
        setSessionChecked(true);
      });
  // Run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect unauthenticated users after session check completes
  useEffect(() => {
    if (!sessionChecked) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [sessionChecked, isAuthenticated, router]);

  // Subscription gate: redirect to onboarding if no active/trial subscription
  useEffect(() => {
    if (!isAuthenticated || subLoading || subscriptionData === undefined) return;
    const exempt = SUBSCRIPTION_EXEMPT.some((p) => pathname.startsWith(p));
    if (exempt) return;
    const status = subscriptionData?.subscription?.status;
    const hasActive =
      status === "ACTIVE" ||
      status === "TRIAL" ||
      status === "GRACE_PERIOD" ||
      status === "PAST_DUE";
    if (!hasActive) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, subLoading, subscriptionData, pathname, router]);

  // Proactive token refresh: check every 60s, refresh if <2min remaining
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndRefresh = async () => {
      if (!expiresAt) return;
      const timeLeft = expiresAt - Date.now();
      if (timeLeft < 2 * 60 * 1000) {
        try {
          const data = await authApi.refreshToken();
          setTokens(data as never);
        } catch {
          clearAuth();
          router.push("/auth/login");
        }
      }
    };

    intervalRef.current = setInterval(checkAndRefresh, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, expiresAt, setTokens, clearAuth, router]);

  // Show spinner while session check is in progress (prevents flash of login redirect)
  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
