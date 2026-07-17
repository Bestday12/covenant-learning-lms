import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "Is this course only for struggling marriages?", a: "No. It is for couples who want to build intentionally, whether they are doing well or facing strain." },
  { q: "Is this biblical?", a: "Yes. The course is rooted in Scripture and designed to help couples apply biblical wisdom practically." },
  { q: "Can churches or facilitators use this?", a: "Yes. The course structure also works well for church groups, mentors, and facilitators." },
  { q: "Do we need to complete it quickly?", a: "No. It can be taken at a pace that works for your season." },
  { q: "What if we're in serious crisis, not just needing growth?", a: "The Marriage Crisis Survival Guide is specifically designed for couples in serious distress, with a stabilisation-first approach." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl font-bold text-covenant-800 text-center mb-12">Frequently Asked Questions</h1>
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className="border border-covenant-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left font-semibold text-covenant-800 hover:bg-covenant-50"
            >
              {f.q}
              <ChevronDown className={`transition-transform ${open === i ? "rotate-180" : ""}`} size={18} />
            </button>
            {open === i && <div className="p-5 pt-0 text-covenant-600 text-sm">{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
