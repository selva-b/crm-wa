"use client";

import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  Clock,
  Zap,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Flame,
  Wifi,
  Shield,
  FileText,
  CreditCard,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "./nav-item";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
  { href: "/inbox", icon: <MessageSquare className="h-5 w-5" />, label: "Inbox", countKey: "inbox" as const },
  { href: "/contacts", icon: <Users className="h-5 w-5" />, label: "Contacts" },
  { href: "/campaigns", icon: <Megaphone className="h-5 w-5" />, label: "Campaigns" },
  { href: "/scheduler", icon: <Clock className="h-5 w-5" />, label: "Scheduler" },
  { href: "/automation", icon: <Zap className="h-5 w-5" />, label: "Automation" },
  { href: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  { href: "/settings/billing", icon: <CreditCard className="h-5 w-5" />, label: "Billing" },
];

const adminNavItems = [
  { href: "/admin/whatsapp-sessions", icon: <Wifi className="h-5 w-5" />, label: "WA Sessions" },
  { href: "/admin/roles-permissions", icon: <Shield className="h-5 w-5" />, label: "Permissions" },
  { href: "/admin/audit-logs", icon: <FileText className="h-5 w-5" />, label: "Audit Logs" },
  { href: "/admin/observability", icon: <Activity className="h-5 w-5" />, label: "Observability" },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const userName = user
    ? `${user.firstName} ${user.lastName}`
    : "User";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col bg-surface-container-lowest transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center h-[var(--header-height)] shrink-0 px-4",
          collapsed ? "justify-center px-0" : "gap-2",
        )}
      >
        <Flame className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-[16px] font-bold text-on-surface tracking-tight">
            CRM<span className="text-primary">-WA</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            count={item.countKey === "inbox" ? 12 : undefined}
            collapsed={collapsed}
          />
        ))}

        {/* Admin section */}
        {user?.role === "ADMIN" && (
          <>
            <div className={cn("pt-3 pb-1", collapsed ? "px-0" : "px-2")}>
              {!collapsed && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/50">
                  Admin
                </span>
              )}
            </div>
            {adminNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div
        className={cn(
          "shrink-0 border-t border-outline-variant/15 px-3 py-3 space-y-2",
          collapsed && "px-1",
        )}
      >
        {/* User info */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2 py-2",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar name={userName} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-on-surface truncate">
                {userName}
              </p>
              <Badge variant="primary" className="mt-0.5">
                {user?.role ?? "User"}
              </Badge>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className={cn(
            "flex items-center gap-1",
            collapsed ? "flex-col" : "justify-between px-2",
          )}
        >
          <ThemeToggle />
          <button
            onClick={() => logout.mutate()}
            className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-lg"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button
            onClick={toggleSidebar}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
