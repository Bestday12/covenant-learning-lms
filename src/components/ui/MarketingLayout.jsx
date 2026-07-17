// src/components/ui/MarketingLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "https://covenantmarriagehelp.com" },
  { label: "Courses", to: "https://covenantmarriagehelp.com/#courses" },
  { label: "About", to: "https://covenantmarriagehelp.com/about.html" },
  { label: "Testimonials", to: "https://covenantmarriagehelp.com/#testimonials" },
  { label: "Blog", to: "https://covenantmarriagehelp.com/blog.html" },
];

export default function MarketingLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-covenant-50 text-covenant-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-covenant-50/95 backdrop-blur border-b border-covenant-100">
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

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-covenant-700">
            {NAV_LINKS.map((l) => (
              <a key={l.to} href={l.to} className="hover:text-gold-600 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-covenant-700 hover:text-gold-600"
            >
              Sign in
            </Link>
            <a
              href="https://covenantmarriagehelp.com/#courses"
              className="rounded-full bg-gold-500 text-covenant-900 px-5 py-2.5 text-sm font-bold hover:bg-gold-400 transition-colors shadow-sm"
            >
              Enrol Now
            </a>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-covenant-50 border-t border-covenant-100">
            {NAV_LINKS.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="text-covenant-700 font-medium">
                {l.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="text-covenant-700 font-medium">
              Sign in
            </Link>
            <a
              href="https://covenantmarriagehelp.com/#courses"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gold-500 text-covenant-900 px-5 py-2.5 text-sm font-bold text-center"
            >
              Enrol Now
            </a>
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
              <li><a href="https://covenantmarriagehelp.com/course-pre-marital-masterclass.html" className="hover:text-gold-400">Pre-Marital Masterclass</a></li>
              <li><a href="https://covenantmarriagehelp.com/course-covenant-marriage-foundation.html" className="hover:text-gold-400">Covenant Marriage Foundation</a></li>
              <li><a href="https://covenantmarriagehelp.com/course-marriage-crisis-survival-guide.html" className="hover:text-gold-400">Marriage Crisis Survival Guide</a></li>
              <li><a href="https://covenantmarriagehelp.com/course-parenting-as-a-team.html" className="hover:text-gold-400">Parenting as a Team</a></li>
              <li><a href="https://covenantmarriagehelp.com/course-blended-family-foundations.html" className="hover:text-gold-400">Blended Family Foundations</a></li>
              <li><a href="https://covenantmarriagehelp.com/course-communication-that-builds-marriage.html" className="hover:text-gold-400">Communication That Builds Marriage</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Company</p>
            <ul className="space-y-2 text-sm text-covenant-100/70">
              <li><a href="https://covenantmarriagehelp.com/about.html" className="hover:text-gold-400">About Us</a></li>
              <li><a href="https://covenantmarriagehelp.com/blog.html" className="hover:text-gold-400">Blog</a></li>
              <li><a href="https://covenantmarriagehelp.com/#testimonials" className="hover:text-gold-400">Testimonials</a></li>
              <li><a href="https://covenantmarriagehelp.com/faq.html" className="hover:text-gold-400">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Support</p>
            <ul className="space-y-2 text-sm text-covenant-100/70">
              <li><a href="https://covenantmarriagehelp.com/contact.html" className="hover:text-gold-400">Contact</a></li>
              <li><a href="https://covenantmarriagehelp.com/privacy-policy.html" className="hover:text-gold-400">Privacy Policy</a></li>
              <li><a href="https://covenantmarriagehelp.com/terms.html" className="hover:text-gold-400">Terms of Service</a></li>
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