import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { SALES_CONTENT } from "@/data/salesPageContent.js";

export default function CourseSalesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const content = SALES_CONTENT[courseId];

  if (!content) {
    return <div className="max-w-3xl mx-auto py-24 text-center">Course not found.</div>;
  }

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-covenant-700 via-covenant-600 to-covenant-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 text-gold-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} /> {content.badge}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
              {content.title} <span className="text-gold-400 italic">{content.titleAccent}</span>
            </h1>
            <p className="text-covenant-50/90 text-lg mb-8 leading-relaxed">{content.subtitle}</p>
            <ul className="space-y-3 mb-8">
              {content.heroPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-covenant-50/90">
                  <CheckCircle2 size={18} className="text-gold-400 shrink-0 mt-0.5" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-covenant-900/40 border border-white/10 rounded-2xl p-8 backdrop-blur">
            <p className="font-serif text-xl font-bold text-white mb-1">
              {content.title} {content.titleAccent}
            </p>
            <p className="text-sm text-covenant-100/70 mb-6">Everything you need to build a stronger marriage</p>
            <div className="bg-gradient-to-br from-covenant-500/40 to-covenant-600/40 rounded-xl p-6 text-center mb-6 border border-gold-500/20">
              <p className="font-serif text-4xl font-bold text-gold-400">£{content.price}</p>
              <p className="text-xs text-covenant-100/60 mt-1">One-time payment · Instant access</p>
            </div>
            <ul className="space-y-2.5 mb-8">
              {content.included.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-covenant-50/90">
                  <CheckCircle2 size={15} className="text-gold-400 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(`/checkout/${content.id}`)}
              className="w-full rounded-full bg-gold-500 text-covenant-900 font-bold py-3.5 hover:bg-gold-400 transition-colors shadow-lg"
            >
              Enrol Now — £{content.price}
            </button>
            <p className="text-xs text-covenant-100/50 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> Secured checkout · Instant access after payment
            </p>
          </div>
        </div>
      </section>

      {/* WHO FOR */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-bold text-covenant-800 text-center mb-10">
          This Course Is For You If...
        </h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {content.whoFor.map((w, i) => (
            <div key={i} className="flex items-start gap-3 bg-covenant-50 border border-covenant-100 rounded-xl p-4">
              <CheckCircle2 size={18} className="text-covenant-500 shrink-0 mt-0.5" />
              <p className="text-covenant-700 text-sm capitalize">{w}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="bg-covenant-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-10">By the End, You Will Be Able To</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {content.outcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-gold-500 text-covenant-900 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-covenant-100/90 capitalize">{o}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-covenant-800 mb-4">
          Your Marriage Is Too Important to Build Casually
        </h2>
        <p className="text-covenant-600 mb-8">
          Enrol today and start building with wisdom, clarity, and covenant purpose.
        </p>
        <button
          onClick={() => navigate(`/checkout/${content.id}`)}
          className="rounded-full bg-gold-500 text-covenant-900 font-bold px-10 py-4 hover:bg-gold-400 transition-colors shadow-lg text-lg"
        >
          Enrol Now — £{content.price}
        </button>
      </section>
    </div>
  );
}
