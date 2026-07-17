import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { LogOut, BookOpen, LayoutDashboard, ShieldCheck, Settings } from "lucide-react";
import { getDisplayName } from "@/utils/getDisplayName.js";

export default function MainLayout() {
  const { isAuthenticated, role, logout, user } = useAuth();
  const displayName = getDisplayName(user, null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
            {/* Logo - IMAGE VERSION */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Covenant Learning" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                // If image fails, show text fallback
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="font-bold text-xl text-brand-800 hidden">
              Covenant Learning
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-brand-700">
            <Link to="/courses-catalog" className="flex items-center gap-1 hover:text-accent-600">
              <BookOpen size={16} /> Browse Courses
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="flex items-center gap-1 hover:text-accent-600">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/settings" className="flex items-center gap-1 hover:text-accent-600">
                <Settings size={16} /> Settings
              </Link>
            )}
            {role === "admin" && (
              <Link to="/admin" className="flex items-center gap-1 hover:text-accent-600">
                <ShieldCheck size={16} /> Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 hover:text-accent-600"
              >
                <LogOut size={16} /> Sign out
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-brand-100 py-6 text-center text-sm text-brand-500">
        © {new Date().getFullYear()} Covenant Learning. Built for marriage preparation and restoration.
      </footer>
    </div>
  );
}
