import type { AuthState } from "@/types/auth";
import { create } from "zustand";

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  setSession: (token, user) => set({ accessToken: token, user }),
  clear: () => set({ accessToken: null, user: null }),
}));

export const getAuthState = () => useAuthStore.getState();
