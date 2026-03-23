"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePageTitle } from "@/hooks/use-page-title";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-semibold text-on-surface">
          Welcome, {user?.firstName}!
        </h2>
        <p className="text-on-surface-variant">
          {user?.email} — {user?.role}
        </p>
        <p className="text-[13px] text-on-surface-variant/60">
          Dashboard coming soon...
        </p>
      </div>
    </div>
  );
}
