import { useAuth } from "@/features/auth/AuthProvider.jsx";

// Role is stored on profiles.role and already loaded into auth context
// No separate "admins" table — just check the role from the auth store
export function useAdminAuth() {
  const { user, isAuthenticated, loading, role } = useAuth();

  const isAdmin = role === "admin" || role === "super_admin";

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading: loading,
  };
}
