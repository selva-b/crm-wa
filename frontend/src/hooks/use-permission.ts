"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRolePermissions } from "./use-rbac";
import type { RolePermission } from "@/lib/types/rbac";

/**
 * Hook to check if the current user has a specific permission.
 * ADMIN role always returns true (bypass).
 *
 * Usage:
 *   const canEdit = useHasPermission("contacts:update");
 *   const canManage = useHasAnyPermission(["campaigns:create", "campaigns:execute"]);
 */
export function useHasPermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user);
  const { data: rolePermissions } = useRolePermissions();

  return useMemo(() => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;

    if (!rolePermissions) return false;
    const rps: RolePermission[] = rolePermissions[user.role] ?? [];
    return rps.some(
      (rp) => `${rp.permission.resource}:${rp.permission.action}` === permission,
    );
  }, [user, rolePermissions, permission]);
}

export function useHasAnyPermission(permissions: string[]): boolean {
  const user = useAuthStore((s) => s.user);
  const { data: rolePermissions } = useRolePermissions();

  return useMemo(() => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;

    if (!rolePermissions) return false;
    const rps: RolePermission[] = rolePermissions[user.role] ?? [];
    const grantedSet = new Set(
      rps.map((rp) => `${rp.permission.resource}:${rp.permission.action}`),
    );
    return permissions.some((p) => grantedSet.has(p));
  }, [user, rolePermissions, permissions]);
}

export function useHasAllPermissions(permissions: string[]): boolean {
  const user = useAuthStore((s) => s.user);
  const { data: rolePermissions } = useRolePermissions();

  return useMemo(() => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;

    if (!rolePermissions) return false;
    const rps: RolePermission[] = rolePermissions[user.role] ?? [];
    const grantedSet = new Set(
      rps.map((rp) => `${rp.permission.resource}:${rp.permission.action}`),
    );
    return permissions.every((p) => grantedSet.has(p));
  }, [user, rolePermissions, permissions]);
}
