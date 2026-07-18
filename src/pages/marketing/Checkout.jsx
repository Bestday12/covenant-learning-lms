import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [addBump, setAddBump] = useState(false);

  if (!content) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        Course not found.
      </div>
    );
  }

  const total = content.price + (addBump ? 17 : 0);

  const handlePay = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let currentUser = user;

      if (!currentUser) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/login");
          return;
        }

        currentUser = session.user;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          courseId,

          userId: currentUser.id,

          email,

          successUrl:
            `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,

          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create checkout session.");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">

      <div>

        <h1 className="font-serif text-3xl font-bold text-covenant-800 mb-2">
          Complete Your Enrolment
        </h1>

        <p className="text-covenant-500 mb-8">
          You're one step away from starting
          {" "}
          {content.title} {content.titleAccent}
        </p>

        <form onSubmit={handlePay} className="space-y-4">

          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-covenant-100 px-4 py-3"
          />

          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-covenant-100 px-4 py-3"
          />

          <label className="flex items-start gap-3 bg-covenant-50 border rounded-lg p-4">

            <input
              type="checkbox"
              checked={addBump}
              onChange={(e) => setAddBump(e.target.checked)}
            />

            <span className="text-sm">

              <strong>
                Add Couple Growth Toolkit (£17)
              </strong>

              <br />

              Weekly check-ins, conversation starters,
              declarations and growth planner.

            </span>

          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold-500 text-covenant-900 font-bold py-4"
          >

            {loading
              ? "Redirecting to Stripe..."
              : `Continue to Secure Payment (£${total})`}

          </button>

          <p className="text-xs text-center text-covenant-500 flex items-center justify-center gap-1">

            <Lock size={12} />

            Secure payment powered by Stripe

          </p>

        </form>

      </div>

      <div className="bg-covenant-50 rounded-2xl p-8 border">

        <h3 className="font-serif text-xl font-bold mb-4">

          {content.title}

        </h3>

        <ul className="space-y-2 mb-6">

          {content.included.map((item) => (

            <li
              key={item}
              className="flex items-center gap-2"
            >

              <CheckCircle2
                size={15}
                className="text-gold-600"
              />

              {item}

            </li>

          ))}

        </ul>

        <div className="border-t pt-4 flex justify-between">

          <span>Course</span>

          <span>£{content.price}</span>

        </div>

        {addBump && (

          <div className="flex justify-between mt-2">

            <span>Toolkit</span>

            <span>£17</span>

          </div>

        )}

        <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">

          <span>Total</span>

          <span>£{total}</span>

        </div>

        <p className="text-xs mt-4 flex gap-2 items-center">

          <ShieldCheck size={14} />

          Payment handled securely by Stripe.
          Course access is granted automatically
          after successful payment.

        </p>

      </div>

    </div>
  );
}