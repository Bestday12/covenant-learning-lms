// src/components/ui/MainLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { LogOut, BookOpen, LayoutDashboard, ShieldCheck, Settings, Menu, X } from "lucide-react";
import { getDisplayName } from "@/utils/getDisplayName.js";
import { useState } from "react";

export default function MainLayout() {
  const { isAuthenticated, role, signOut, user } = useAuth();
  const displayName = getDisplayName(user, null);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo - links to marketing site */}
          <a href="https://covenantmarriagehelp.com" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Covenant Marriage Help" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="font-bold text-xl text-brand-800 hidden">
              Covenant Marriage Help
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-700">
            <a href="https://covenantmarriagehelp.com" className="hover:text-accent-600">Home</a>
            <a href="https://covenantmarriagehelp.com/about.html" className="hover:text-accent-600">About</a>
            <a href="https://covenantmarriagehelp.com/#testimonials" className="hover:text-accent-600">Testimonials</a>
            <a href="https://covenantmarriagehelp.com/blog.html" className="hover:text-accent-600">Blog</a>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-1 hover:text-accent-600">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/settings" className="flex items-center gap-1 hover:text-accent-600">
                  <Settings size={16} /> Settings
                </Link>
                {role === "admin" && (
                  <Link to="/admin" className="flex items-center gap-1 hover:text-accent-600">
                    <ShieldCheck size={16} /> Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-accent-600"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-accent-600">Sign In</Link>
                <a
                  href="https://covenantmarriagehelp.com/#courses"
                  className="rounded-full bg-accent-500 text-white px-4 py-2 hover:bg-accent-600 transition-colors"
                >
                  Enrol Now
                </a>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-100 bg-white px-6 py-4">
            <nav className="flex flex-col gap-3 text-sm font-medium text-brand-700">
              <a href="https://covenantmarriagehelp.com" className="hover:text-accent-600">Home</a>
              <a href="https://covenantmarriagehelp.com/about.html" className="hover:text-accent-600">About</a>
              <a href="https://covenantmarriagehelp.com/#testimonials" className="hover:text-accent-600">Testimonials</a>
              <a href="https://covenantmarriagehelp.com/blog.html" className="hover:text-accent-600">Blog</a>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="hover:text-accent-600">Dashboard</Link>
                  <Link to="/settings" className="hover:text-accent-600">Settings</Link>
                  {role === "admin" && (
                    <Link to="/admin" className="hover:text-accent-600">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="text-left hover:text-accent-600">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-accent-600">Sign In</Link>
                  <a
                    href="https://covenantmarriagehelp.com/#courses"
                    className="rounded-full bg-accent-500 text-white px-4 py-2 text-center hover:bg-accent-600 transition-colors"
                  >
                    Enrol Now
                  </a>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-100 py-6 text-center text-sm text-brand-500">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold text-brand-800 mb-3">Covenant Marriage Help</h3>
              <p className="text-brand-500 text-xs">Biblical help for building stronger marriages. Practical tools for Christ-centred covenant growth.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-brand-700 mb-3">Courses</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="https://covenantmarriagehelp.com/course-pre-marital-masterclass.html" className="text-brand-500 hover:text-accent-600">Pre-Marital Masterclass</a></li>
                <li><a href="https://covenantmarriagehelp.com/course-covenant-marriage-foundation.html" className="text-brand-500 hover:text-accent-600">Covenant Marriage Foundation</a></li>
                <li><a href="https://covenantmarriagehelp.com/course-marriage-crisis-survival-guide.html" className="text-brand-500 hover:text-accent-600">Marriage Crisis Survival Guide</a></li>
                <li><a href="https://covenantmarriagehelp.com/course-parenting-as-a-team.html" className="text-brand-500 hover:text-accent-600">Parenting as a Team</a></li>
                <li><a href="https://covenantmarriagehelp.com/course-blended-family-foundations.html" className="text-brand-500 hover:text-accent-600">Blended Family Foundations</a></li>
                <li><a href="https://covenantmarriagehelp.com/course-communication-that-builds-marriage.html" className="text-brand-500 hover:text-accent-600">Communication That Builds Marriage</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-brand-700 mb-3">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="https://covenantmarriagehelp.com/about.html" className="text-brand-500 hover:text-accent-600">About Us</a></li>
                <li><a href="https://covenantmarriagehelp.com/blog.html" className="text-brand-500 hover:text-accent-600">Blog</a></li>
                <li><a href="https://covenantmarriagehelp.com/#testimonials" className="text-brand-500 hover:text-accent-600">Testimonials</a></li>
                <li><a href="https://covenantmarriagehelp.com/faq.html" className="text-brand-500 hover:text-accent-600">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-brand-700 mb-3">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="https://covenantmarriagehelp.com/contact.html" className="text-brand-500 hover:text-accent-600">Contact</a></li>
                <li><a href="https://covenantmarriagehelp.com/privacy-policy.html" className="text-brand-500 hover:text-accent-600">Privacy Policy</a></li>
                <li><a href="https://covenantmarriagehelp.com/terms.html" className="text-brand-500 hover:text-accent-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-brand-100 pt-6">
            © {new Date().getFullYear()} Covenant Marriage Help. Marriage help rooted in Scripture, shaped by wisdom, and built for lasting growth.
          </div>
        </div>
      </footer>
    </div>
  );
}