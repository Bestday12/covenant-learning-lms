import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { SALES_CONTENT } from "@/data/salesPageContent.js";
import { signUp } from "@/services/authService.js";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { supabase } from "@/lib/supabase.js";

const STRIPE_PAYMENT_LINKS = {
  "pre-marital-masterclass": "",
  "covenant-marriage-foundation": "",
  "marriage-crisis-survival-guide": "",
};

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const content = SALES_CONTENT[courseId];
  const [addBump, setAddBump] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  if (!content) return <div className="max-w-3xl mx-auto py-24 text-center">Course not found.</div>;

  const total = content.price + (addBump ? 17 : 0);
  const liveLink = STRIPE_PAYMENT_LINKS[courseId];

  const createDemoSession = async () => {
    const { user } = await signUp(email, "demo-password", fullName);
    setUser(user, user?.user_metadata?.role || "student");

    if (supabase && user?.id) {
      const { error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: courseId });
      if (error && error.code !== "23505") {
        throw error;
      }
    } else {
      const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
      if (!enrolledCourses.includes(courseId)) {
        enrolledCourses.push(courseId);
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
      }
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDemoSession();

      if (liveLink) {
        const redirectUrl = new URL(liveLink);
        redirectUrl.searchParams.set("prefilled_email", email);
        window.location.href = redirectUrl.toString();
        return;
      }

      setTimeout(() => navigate(`/thank-you/${courseId}`), 700);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="font-serif text-3xl font-bold text-covenant-800 mb-2">Complete Your Enrolment</h1>
        <p className="text-covenant-500 mb-8">
          You're one step away from starting {content.title} {content.titleAccent}.
        </p>

        <form onSubmit={handlePay} className="space-y-4">
          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          />

          {!liveLink && (
            <>
              <input required placeholder="Card number" className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="MM / YY" className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" />
                <input required placeholder="CVC" className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" />
              </div>
            </>
          )}

          <label className="flex items-start gap-3 bg-covenant-50 border border-covenant-100 rounded-lg p-4 cursor-pointer">
            <input type="checkbox" checked={addBump} onChange={(e) => setAddBump(e.target.checked)} className="mt-1" />
            <span className="text-sm text-covenant-700">
              <strong>Yes, add the Couple Growth Toolkit — £17</strong><br />
              Weekly check-ins, 30 conversation starters, 30-day growth challenge, covenant declaration sheet.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold-500 text-covenant-900 font-bold py-4 hover:bg-gold-400 transition-colors shadow-lg disabled:opacity-60"
          >
            {loading ? "Processing..." : `Complete My Enrolment — £${total}`}
          </button>
          <p className="text-xs text-covenant-400 text-center flex items-center justify-center gap-1">
            <Lock size={12} /> Secure checkout · {liveLink ? "Powered by Stripe" : "Instant access after payment"}
          </p>
        </form>
      </div>

      <div className="bg-covenant-50 rounded-2xl p-8 border border-covenant-100 h-fit">
        <h3 className="font-serif text-lg font-bold text-covenant-800 mb-4">{content.title} {content.titleAccent}</h3>
        <ul className="space-y-2 mb-6">
          {content.included.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-covenant-700">
              <CheckCircle2 size={14} className="text-gold-600 shrink-0" /> {item}
            </li>
          ))}
        </ul>
        <div className="border-t border-covenant-100 pt-4 flex justify-between text-sm text-covenant-600 mb-1">
          <span>Course</span><span>£{content.price}</span>
        </div>
        {addBump && (
          <div className="flex justify-between text-sm text-covenant-600 mb-1">
            <span>Couple Growth Toolkit</span><span>£17</span>
          </div>
        )}
        <div className="border-t border-covenant-100 pt-4 flex justify-between font-bold text-covenant-800">
          <span>Total</span><span>£{total}</span>
        </div>
        <p className="text-xs text-covenant-400 mt-4 flex items-center gap-1">
          <ShieldCheck size={12} />
          {liveLink ? "Secured by Stripe. Redirects to Stripe's hosted checkout." : "This is a demo checkout. No real payment is processed."}
        </p>
      </div>
    </div>
  );
}