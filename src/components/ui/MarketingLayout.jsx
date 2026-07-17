import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses-catalog" },
  { label: "About", to: "/about" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Blog", to: "/blog" },
];

export default function MarketingLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-covenant-50 text-covenant-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-covenant-50/95 backdrop-blur border-b border-covenant-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Covenant Learning" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="font-bold text-xl text-brand-800 hidden">
              Covenant Learning
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-covenant-700">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-gold-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-covenant-700 hover:text-gold-600"
            >
              Sign in
            </Link>
            <button
              onClick={() => navigate("/courses-catalog")}
              className="rounded-full bg-gold-500 text-covenant-900 px-5 py-2.5 text-sm font-bold hover:bg-gold-400 transition-colors shadow-sm"
            >
              Enrol Now
            </button>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-covenant-50 border-t border-covenant-100">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-covenant-700 font-medium">
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="text-covenant-700 font-medium">
              Sign in
            </Link>
            <button
              onClick={() => { setOpen(false); navigate("/courses-catalog"); }}
              className="rounded-full bg-gold-500 text-covenant-900 px-5 py-2.5 text-sm font-bold"
            >
              Enrol Now
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-covenant-900 text-covenant-100 py-14 mt-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <p className="font-serif text-lg font-bold text-white mb-3">Covenant Marriage Help</p>
            <p className="text-sm text-covenant-100/70 leading-relaxed">
              Biblical help for building stronger marriages. Practical tools for Christ-centred covenant growth.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Courses</p>
            <ul className="space-y-2 text-sm text-covenant-100/70">
              <li><Link to="/courses/pre-marital-masterclass" className="hover:text-gold-400">Pre-Marital Masterclass</Link></li>
              <li><Link to="/courses/covenant-marriage-foundation" className="hover:text-gold-400">Covenant Marriage Foundation</Link></li>
              <li><Link to="/courses/marriage-crisis-survival-guide" className="hover:text-gold-400">Marriage Crisis Survival Guide</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Company</p>
            <ul className="space-y-2 text-sm text-covenant-100/70">
              <li><Link to="/about" className="hover:text-gold-400">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-gold-400">Blog</Link></li>
              <li><Link to="/testimonials" className="hover:text-gold-400">Testimonials</Link></li>
              <li><Link to="/faq" className="hover:text-gold-400">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Support</p>
            <ul className="space-y-2 text-sm text-covenant-100/70">
              <li><Link to="/contact" className="hover:text-gold-400">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-gold-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/10 text-xs text-covenant-100/50 text-center">
          © {new Date().getFullYear()} Covenant Marriage Help. Marriage help rooted in Scripture, shaped by wisdom, and built for lasting growth.
        </div>
      </footer>
    </div>
  );
}
