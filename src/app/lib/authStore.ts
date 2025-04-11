import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isForbidden: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string | null, user: User | null) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setForbidden: (isForbidden: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isForbidden: false,
      isAuthenticated: false,
      setAuth: (token, user) =>
        set({
          accessToken: token,
          user: user,
          isAuthenticated: !!token,
          isForbidden: false,
        }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) =>
        set({
          accessToken: token,
          isAuthenticated: !!token,
        }),
      setForbidden: (isForbidden) => set({ isForbidden }),
      logout: () => {
        console.log("AuthStore: Logging out - clearing state.");
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isForbidden: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),

      onRehydrateStorage: () => {
        console.log("AuthStore: Rehydrating user from storage.");

        return (_state, error) => {
          if (error) console.error("AuthStore: Error rehydrating:", error);
        };
      },
    }
  )
);

export const getAccessToken = () => useAuthStore.getState().accessToken;
