// src/pages/marketing/MarketingHome.jsx
import { Link } from "react-router-dom";
import { CheckCircle2, Heart, Shield, Compass, Sparkles } from "lucide-react";
import { SALES_CONTENT } from "@/data/salesPageContent.js";

const FEATURED = SALES_CONTENT["covenant-marriage-foundation"];

export default function MarketingHome() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-covenant-700 via-covenant-600 to-covenant-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 text-gold-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} /> PREMIUM ONLINE MARRIAGE COURSE
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
              Build a Stronger, <span className="text-gold-400 italic">Christ-Centred</span> Marriage
            </h1>
            <p className="text-covenant-50/90 text-lg mb-8 leading-relaxed">
              A premium 10-module Christian marriage course helping couples strengthen communication,
              resolve conflict biblically, deepen connection, grow in spiritual unity, and build a
              marriage that lasts.
            </p>
            <ul className="space-y-2 mb-8">
              {["10 practical, biblical teaching modules", "Complete student workbook included", "Printable worksheets and couple exercises", "Facilitator guide for church groups", "Guided prayer, reflection, and action steps", "Self-paced — work at your own rhythm"].map((pt) => (
                <li key={pt} className="flex items-start gap-2 text-sm text-covenant-50/90">
                  <CheckCircle2 size={16} className="text-gold-400 shrink-0 mt-0.5" /> {pt}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 flex-wrap">
              <a href="https://covenantmarriagehelp.com/#courses" className="rounded-full bg-gold-500 text-covenant-900 font-bold px-6 py-3 hover:bg-gold-400 transition-colors shadow-lg">
                Explore the Course
              </a>
              <a href="https://covenantmarriagehelp.com/#book" className="rounded-full border border-white/30 text-white font-medium px-6 py-3 hover:bg-white/10 transition-colors">
                Get Marriage Help
              </a>
            </div>
          </div>

          <div className="bg-covenant-900/40 border border-white/10 rounded-2xl p-8 backdrop-blur">
            <p className="font-serif text-xl font-bold text-white mb-1">The Covenant Marriage Foundation</p>
            <p className="text-sm text-covenant-100/70 mb-6">Everything you need to build a stronger marriage</p>
            <div className="bg-gradient-to-br from-covenant-500/40 to-covenant-600/40 rounded-xl p-6 text-center mb-6 border border-gold-500/20">
              <p className="font-serif text-4xl font-bold text-gold-400">£{FEATURED.price}</p>
              <p className="text-xs text-covenant-100/60 mt-1">One-time payment · Instant access</p>
            </div>
            <ul className="space-y-2.5 mb-8">
              {FEATURED.included.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-covenant-50/90">
                  <CheckCircle2 size={15} className="text-gold-400 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <a
              href="https://covenantmarriagehelp.com/course-covenant-marriage-foundation.html"
              className="w-full block text-center rounded-full bg-gold-500 text-covenant-900 font-bold py-3.5 hover:bg-gold-400 transition-colors shadow-lg"
            >
              Enrol Now — £{FEATURED.price}
            </a>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold text-covenant-800 mb-4">Our Mission</h2>
        <p className="text-covenant-600 text-lg leading-relaxed">
          Marriage is one of God's greatest gifts, but it is also one of life's greatest responsibilities.
          At Covenant Marriage Help, our mission is simple: to help couples build stronger marriages
          through biblical wisdom, practical tools, and covenant-centred growth. This is not about
          surface advice. It is about real transformation.
        </p>
      </section>

      {/* 3 COURSES */}
      <section className="bg-covenant-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-covenant-800 text-center mb-12">
            Choose the Path That Fits Your Season
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Compass, key: "pre-marital-masterclass", tone: "text-covenant-500", link: "course-pre-marital-masterclass.html" },
              { icon: Heart, key: "covenant-marriage-foundation", tone: "text-gold-600", link: "course-covenant-marriage-foundation.html" },
              { icon: Shield, key: "marriage-crisis-survival-guide", tone: "text-covenant-700", link: "course-marriage-crisis-survival-guide.html" },
            ].map(({ icon: Icon, key, tone, link }) => {
              const c = SALES_CONTENT[key];
              return (
                <div key={key} className="bg-white rounded-2xl border border-covenant-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <Icon className={`${tone} mb-4`} size={32} />
                  <h3 className="font-serif text-xl font-bold text-covenant-800 mb-2">
                    {c.title} {c.titleAccent}
                  </h3>
                  <p className="text-covenant-500 text-sm mb-6">{c.subtitle}</p>
                  <p className="font-serif text-2xl font-bold text-gold-600 mb-4">£{c.price}</p>
                  <a
                    href={`https://covenantmarriagehelp.com/${link}`}
                    className="inline-block rounded-full bg-covenant-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-covenant-700 transition-colors"
                  >
                    View the Course
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ENCOURAGEMENT */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl font-bold text-covenant-800 mb-6">
          A Stronger Marriage Is Possible
        </h2>
        <p className="text-covenant-600 text-lg leading-relaxed mb-2">
          Not because couples are perfect. Not because every season is easy.
        </p>
        <p className="text-covenant-600 text-lg leading-relaxed mb-8">
          But because growth is possible wherever there is humility, willingness, truth, prayer, and God's grace.
        </p>
        <a
          href="https://covenantmarriagehelp.com/#courses"
          className="rounded-full bg-covenant-600 text-white font-bold px-8 py-3.5 hover:bg-covenant-700 transition-colors inline-block"
        >
          Start With the Course
        </a>
      </section>
    </div>
  );
}