"use client";

import { create } from "zustand";
import type { AuthUser } from "@/lib/types/auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  expiresAt: number | null;
  isAuthenticated: boolean;

  setAuth: (data: {
    accessToken: string;
    expiresIn: number;
    user: AuthUser;
  }) => void;
  setTokens: (data: {
    accessToken: string;
    expiresIn: number;
  }) => void;
  clearAuth: () => void;
}

function setSessionCookie(hasSession: boolean) {
  if (typeof document === "undefined") return;
  if (hasSession) {
    document.cookie = "hasSession=1; path=/; SameSite=Strict";
  } else {
    document.cookie =
      "hasSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  expiresAt: null,
  isAuthenticated: false,

  setAuth: ({ accessToken, expiresIn, user }) => {
    setSessionCookie(true);
    set({
      accessToken,
      user,
      expiresAt: Date.now() + expiresIn * 1000,
      isAuthenticated: true,
    });
  },

  setTokens: ({ accessToken, expiresIn }) => {
    setSessionCookie(true);
    set({
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    });
  },

  clearAuth: () => {
    setSessionCookie(false);
    set({
      accessToken: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
    });
  },
}));
