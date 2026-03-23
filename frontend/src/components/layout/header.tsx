"use client";

import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const pageTitle = useUIStore((s) => s.pageTitle);
  const userName = user
    ? `${user.firstName} ${user.lastName}`
    : "User";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-[var(--header-height)] items-center gap-4 bg-surface-container-lowest px-6 transition-[margin-left] duration-200 ease-in-out",
        collapsed
          ? "ml-[var(--sidebar-collapsed)]"
          : "ml-[var(--sidebar-width)]",
      )}
    >
      {/* Page title */}
      <h1 className="text-[18px] font-semibold text-on-surface shrink-0">
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <SearchInput placeholder="Search..." shortcutHint="⌘K" />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationCenter />
        <Avatar name={userName} size="sm" />
      </div>
    </header>
  );
}
