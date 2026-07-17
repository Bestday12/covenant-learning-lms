import { Link } from "react-router-dom";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-serif text-7xl font-bold text-accent-500 mb-2">404</p>
      <h1 className="font-serif text-2xl font-bold text-brand-800 mb-2">
        This Page Has Wandered Off
      </h1>
      <p className="text-brand-500 max-w-md mb-8">
        The page you're looking for doesn't exist or may have moved.
        Let's get you back on the path.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 font-medium hover:bg-brand-700 transition-colors"
        >
          <Home size={16} /> Go to Dashboard
        </Link>
        <Link
          to="/courses-catalog"
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 text-brand-700 px-6 py-3 font-medium hover:border-brand-400 transition-colors"
        >
          <Compass size={16} /> Browse Courses
        </Link>
      </div>
    </div>
  );
}