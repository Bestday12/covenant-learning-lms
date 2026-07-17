import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: "guest", // guest | student | facilitator | admin
      isAuthenticated: false,
      setUser: (user, role = "student") =>
        set({ user, role, isAuthenticated: !!user }),
      logout: () => set({ user: null, role: "guest", isAuthenticated: false }),
    }),
    { name: "auth-storage" }
  )
);
