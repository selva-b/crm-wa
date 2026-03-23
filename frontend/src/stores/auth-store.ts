"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
  }) => void;
  setTokens: (data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

function setSessionCookie(hasSession: boolean) {
  if (typeof document === "undefined") return;
  if (hasSession) {
    document.cookie = "hasSession=1; path=/; SameSite=Lax";
  } else {
    document.cookie =
      "hasSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: ({ accessToken, refreshToken, expiresIn, user }) => {
        setSessionCookie(true);
        set({
          accessToken,
          refreshToken,
          user,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
        });
      },

      setTokens: ({ accessToken, refreshToken, expiresIn }) => {
        setSessionCookie(true);
        set({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
        });
      },

      clearAuth: () => {
        setSessionCookie(false);
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "crm-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
