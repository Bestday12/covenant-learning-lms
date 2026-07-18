import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { SALES_CONTENT } from "@/data/salesPageContent.js";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { supabase } from "@/lib/supabase.js";

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const content = SALES_CONTENT[courseId];
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [addBump, setAddBump] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=" + window.location.pathname);
    }
  }, [user, navigate]);

  if (!content) {
    return <div className="max-w-3xl mx-auto py-24 text-center">Course not found.</div>;
  }

  const bumpPrice = 17;
  const total = content.price + (addBump ? bumpPrice : 0);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!email || !fullName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          userId: user.id,
          email: email.trim(),
          successUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout.");
      }

      window.location.href = data.url; // Redirect to Stripe
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
      {/* Left Column - Form */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-covenant-800 mb-2">
          Complete Your Enrolment
        </h1>
        <p className="text-covenant-500 mb-8">
          You're one step away from starting{" "}
          <span className="font-semibold">{content.title}</span>
        </p>

        <form onSubmit={handlePay} className="space-y-4">
          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-covenant-100 px-4 py-3 focus:outline-none focus:border-gold-500"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-covenant-100 px-4 py-3 focus:outline-none focus:border-gold-500"
          />

          {/* Bump Offer */}
          <label className="flex items-start gap-3 bg-covenant-50 border rounded-lg p-4 cursor-pointer hover:bg-covenant-100 transition">
            <input
              type="checkbox"
              checked={addBump}
              onChange={(e) => setAddBump(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              <strong>Add Couple Growth Toolkit (£{bumpPrice})</strong>
              <br />
              Weekly check-ins, conversation starters, declarations and growth planner.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold-500 text-covenant-900 font-bold py-4 hover:bg-gold-400 transition disabled:opacity-70"
          >
            {loading ? "Redirecting to secure payment..." : `Pay £${total} Now`}
          </button>

          <p className="text-xs text-center text-covenant-500 flex items-center justify-center gap-1">
            <Lock size={12} /> Secure checkout powered by Stripe
          </p>
        </form>
      </div>

      {/* Right Column - Order Summary */}
      <div className="bg-covenant-50 rounded-2xl p-8 border h-fit">
        <h3 className="font-serif text-xl font-bold mb-4">{content.title}</h3>
        
        <ul className="space-y-2 mb-6">
          {content.included.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={15} className="text-gold-600" />
              {item}
            </li>
          ))}
        </ul>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Course</span>
            <span>£{content.price}</span>
          </div>
          {addBump && (
            <div className="flex justify-between">
              <span>Couple Growth Toolkit</span>
              <span>£{bumpPrice}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>£{total}</span>
        </div>

        <p className="text-xs mt-6 flex gap-2 items-center text-covenant-600">
          <ShieldCheck size={14} />
          Payment handled securely by Stripe. Instant access after payment.
        </p>
      </div>
    </div>
  );
}