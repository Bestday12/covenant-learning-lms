import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../shared/hooks/useAdminAuth";

export default function PrivateAdminRoute() {
  const { isLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Loading admin...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
