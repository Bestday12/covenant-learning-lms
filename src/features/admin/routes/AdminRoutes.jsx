import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider.jsx";

import AdminShell from "@/features/admin/shared/layout/AdminShell.jsx";
import AdminDashboard from "@/features/admin/dashboard/pages/AdminDashboard.jsx";
import AdminUsers from "@/features/admin/users/pages/AdminUsers.jsx";
import AdminCourses from "@/features/admin/courses/pages/AdminCourses.jsx";
import AdminCourseDetail from "@/features/admin/courses/pages/AdminCourseDetail.jsx";
import AdminPartners from "@/features/admin/partners/pages/AdminPartners.jsx";
import AdminSettings from "@/features/admin/settings/pages/AdminSettings.jsx";
import AdminCreateCourse from "@/features/admin/courses/pages/AdminCreateCourse.jsx";


export function AdminGuard() {
  const { isAuthenticated, role, loading } = useAuth();
  
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin" && role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function AdminShellRoute() {
  return <AdminShell />;
}

export const adminChildren = [
  {
    index: true,
    element: <Navigate to="dashboard" replace />,
  },
  {
    path: "dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "users",
    element: <AdminUsers />,
  },
  {
    path: "courses",
    element: <AdminCourses />,
  },
  {
    path: "courses/new",
    element: <AdminCreateCourse />,
  },
  {
    path: "courses/:courseId",
    element: <AdminCourseDetail />,
  },
  {
    path: "partners",
    element: <AdminPartners />,
  },
  {
    path: "settings",
    element: <AdminSettings />,
  },
  {
    path: "*",
    element: <Navigate to="dashboard" replace />,
  },
];