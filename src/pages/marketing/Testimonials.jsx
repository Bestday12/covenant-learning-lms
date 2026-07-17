const TESTIMONIALS = [
  { name: "Daniel & Grace O.", course: "Covenant Marriage Foundation", quote: "This course gave us language for conversations we had avoided for years. We finally feel like a team." },
  { name: "Michael & Ruth A.", course: "Marriage Crisis Survival Guide", quote: "We were on the edge of separating. This gave us a structured, biblical way back to each other." },
  { name: "James & Faith T.", course: "Pre-Marital Masterclass", quote: "We entered our engagement with so much more clarity. The discernment questions were exactly what we needed." },
  { name: "Samuel & Joy K.", course: "Covenant Marriage Foundation", quote: "Practical, biblical, and honest. Not fluffy advice — a real roadmap for our marriage." },
];

export default function Testimonials() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl font-bold text-covenant-800 text-center mb-4">Couples Who Have Grown With Us</h1>
      <p className="text-covenant-500 text-center mb-14">Real stories from couples building stronger, Christ-centred marriages.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="bg-white border border-covenant-100 rounded-2xl p-8 shadow-sm">
            <p className="text-covenant-700 italic mb-4">"{t.quote}"</p>
            <p className="font-semibold text-covenant-800">{t.name}</p>
            <p className="text-xs text-gold-600">{t.course}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
