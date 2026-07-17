import { Link } from "react-router-dom";
import { SALES_CONTENT } from "@/data/salesPageContent.js";

export default function MarketingCatalog() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl font-bold text-covenant-800 text-center mb-4">Our Courses</h1>
      <p className="text-covenant-500 text-center mb-14 max-w-xl mx-auto">
        Christ-centred courses for every season of marriage — preparation, growth, or restoration.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(SALES_CONTENT).map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-covenant-100 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <span className="text-xs font-bold text-gold-600 mb-3">{c.badge}</span>
            <h3 className="font-serif text-xl font-bold text-covenant-800 mb-2">
              {c.title} {c.titleAccent}
            </h3>
            <p className="text-covenant-500 text-sm mb-6 flex-1">{c.subtitle}</p>
            <p className="font-serif text-2xl font-bold text-gold-600 mb-4">£{c.price}</p>
            <Link
              to={`/courses/${c.id}`}
              className="text-center rounded-full bg-covenant-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-covenant-700 transition-colors"
            >
              View the Course
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
