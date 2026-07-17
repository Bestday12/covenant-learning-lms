import { Link } from "react-router-dom";

const POSTS = [
  { slug: "why-covenant-matters", title: "Why Covenant Matters More Than Feelings", excerpt: "Feelings rise and fall. Covenant remains. Here's why that distinction changes everything." },
  { slug: "5-signs-of-readiness", title: "5 Signs You're Ready for Marriage", excerpt: "Desiring marriage is not the same as being ready. Here's how to tell the difference." },
  { slug: "rebuilding-trust", title: "Rebuilding Trust After a Crisis", excerpt: "Trust doesn't return overnight. Here's a biblical, step-by-step approach to rebuilding it." },
];

export default function Blog() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl font-bold text-covenant-800 text-center mb-14">From the Blog</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {POSTS.map((p) => (
          <div key={p.slug} className="bg-white border border-covenant-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-covenant-800 mb-2">{p.title}</h3>
            <p className="text-covenant-500 text-sm mb-4">{p.excerpt}</p>
            <Link to="#" className="text-gold-600 text-sm font-semibold">Read more →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
