"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isForbidden: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setForbidden: (isForbidden: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isForbidden: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setForbidden: (isForbidden) => set({ isForbidden }),
      logout: () => set({ user: null, token: null, isForbidden: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
