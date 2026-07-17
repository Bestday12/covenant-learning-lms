import { create } from "zustand";

export const useUIStore = create((set) => ({
  theme: "light",
  sidebarOpen: true,
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
