"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { Spinner } from "@/components/ui/spinner";
import { AppShell } from "@/components/layout/app-shell";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
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
