"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { Spinner } from "@/components/ui/spinner";
import { AppShell } from "@/components/layout/app-shell";
import { useSubscription } from "@/hooks/use-billing";

// Pages exempt from subscription gate
const SUBSCRIPTION_EXEMPT = ["/onboarding", "/settings/billing"];

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const { data: subscriptionData, isLoading: subLoading } = useSubscription();
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  // Subscription gate: redirect to onboarding if no active/trial subscription
  useEffect(() => {
    if (!isAuthenticated || subLoading || subscriptionData === undefined) return;
    const exempt = SUBSCRIPTION_EXEMPT.some((p) => pathname.startsWith(p));
    if (exempt) return;
    const status = subscriptionData?.subscription?.status;
    const hasActive = status === "ACTIVE" || status === "TRIAL" || status === "GRACE_PERIOD" || status === "PAST_DUE";
    if (!hasActive) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, subLoading, subscriptionData, pathname, router]);

  // Proactive token refresh: check every 60s, refresh if <2min remaining
  useEffect(() => {
    if (!isAuthenticated || !refreshToken) return;

    const checkAndRefresh = async () => {
      if (!expiresAt) return;
      const timeLeft = expiresAt - Date.now();
      if (timeLeft < 2 * 60 * 1000) {
        try {
          const data = await authApi.refreshToken({ refreshToken });
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
  }, [isAuthenticated, refreshToken, expiresAt, setTokens, clearAuth, router]);

  if (!isHydrated) {
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
