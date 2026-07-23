// src/pages/marketing/ThankYou.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, BookOpen, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { trackPurchase } from "@/hooks/useFacebookPixel.js";
import CourseUpsell from "@/components/ui/CourseUpsell.jsx";


export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(20);

  // Auto-redirect to dashboard after 10 seconds
  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = "/dashboard";
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

useEffect(() => {
  const sessionId = searchParams.get("session_id");
  if (sessionId) {
    trackPurchase("unknown", "Course Purchase", 0, sessionId);
  }
}, []);

  return (
    <div style={{ background: "linear-gradient(135deg, #3d0a6e 0%, #5a1a9a 50%, #2a0550 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: "620px", width: "100%" }}>

        {/* Card */}
        <div style={{ background: "#ffffff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>

          {/* Gold top bar */}
          <div style={{ background: "linear-gradient(135deg, #c9960c, #e8b422)", height: "6px" }} />

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #3d0a6e, #5a1a9a)", padding: "40px 48px", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", background: "rgba(201,150,12,0.2)", border: "2px solid rgba(201,150,12,0.5)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 size={36} color="#f5d060" />
            </div>
            <h1 style={{ margin: "0 0 8px", fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "700", color: "#ffffff", lineHeight: "1.2" }}>
              Payment Confirmed!
            </h1>
            <p style={{ margin: "0", fontSize: "15px", color: "rgba(255,255,255,0.7)" }}>
              Welcome to Covenant Learning
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "40px 48px" }}>

            <p style={{ margin: "0 0 8px", fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "700", color: "#3d0a6e", lineHeight: "1.4" }}>
              You're enrolled. Your journey begins now.
            </p>
            <p style={{ margin: "0 0 28px", fontSize: "15px", color: "#6b5f7a", lineHeight: "1.7" }}>
              Check your inbox — we've sent your course access details and a personal welcome from Reverend Sam. 
              {user ? "" : " If this is your first purchase, your login credentials are in that email."}
            </p>
			
            {/* What happens next */}
            <div style={{ background: "#faf6ef", border: "1px solid rgba(201,150,12,0.2)", borderRadius: "12px", padding: "24px", marginBottom: "28px" }}>
              <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "700", color: "#c9960c", textTransform: "uppercase", letterSpacing: "1px" }}>
                What Happens Next
              </p>
              {[
                { icon: "✉️", text: "Check your email for your welcome message and login details from Reverend Sam" },
                { icon: "🔑", text: user ? "Log in to your dashboard and find your enrolled course waiting for you" : "Use the temporary password in your email to log in — then update it in Settings" },
                { icon: "📖", text: "Begin with Module 1 — work through each lesson prayerfully at your own pace" },
                { icon: "💬", text: "Message Reverend Sam on WhatsApp if you need prayer or support along the way" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: i < 3 ? "12px" : "0" }}>
                  <span style={{ fontSize: "16px", flexShrink: "0", marginTop: "2px" }}>{item.icon}</span>
                  <p style={{ margin: "0", fontSize: "14px", color: "#3d0a6e", lineHeight: "1.6" }}>{item.text}</p>
                </div>
              ))}
            </div>

            {/* Scripture */}
            <div style={{ borderLeft: "4px solid #c9960c", paddingLeft: "20px", marginBottom: "32px" }}>
              <p style={{ margin: "0 0 6px", fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "italic", color: "#3d0a6e", lineHeight: "1.7" }}>
                "Commit to the Lord whatever you do, and he will establish your plans."
              </p>
              <p style={{ margin: "0", fontSize: "11px", fontWeight: "700", color: "#c9960c", textTransform: "uppercase", letterSpacing: "1px" }}>
                Proverbs 16:3
              </p>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
              <Link
                to="/dashboard"
                style={{ flex: "1", minWidth: "180px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #3d0a6e, #5a1a9a)", color: "#ffffff", textDecoration: "none", padding: "14px 24px", borderRadius: "50px", fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: "700" }}
              >
                <BookOpen size={16} />
                Go to Dashboard
              </Link>
              <a
                href="https://wa.me/447428316189?text=Hello%20Reverend%20Sam%2C%20I%20have%20just%20enrolled%20in%20a%20Covenant%20Learning%20course!"
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: "1", minWidth: "180px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#25d366", color: "#ffffff", textDecoration: "none", padding: "14px 24px", borderRadius: "50px", fontSize: "15px", fontWeight: "700" }}
              >
                <MessageCircle size={16} />
                WhatsApp Rev. Sam
              </a>
            </div>

            {/* Auto redirect notice */}
            <p style={{ margin: "0", textAlign: "center", fontSize: "12px", color: "#9d8fb0" }}>
              Redirecting to your dashboard in {countdown} seconds...
            </p>

          </div>

          {/* Gold bottom bar */}
          <div style={{ background: "linear-gradient(135deg, #c9960c, #e8b422)", height: "4px" }} />

        </div>

       {/* Footer note */}
        <p style={{ margin: "20px 0 0", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          Questions? Email <a href="mailto:support@covenantmarriagehelp.com" style={{ color: "#f5d060", textDecoration: "none" }}>support@covenantmarriagehelp.com</a>
        </p>
      </div>

      
      {/* Upsell — shown below the main card */}
      <div style={{ background: "#ffffff", borderRadius: "16px", marginTop: "16px", padding: "8px 0" }}>
        <CourseUpsell
          completedCourseId={null}
          userId={user?.id}
          variant="thankyou"
        />
      </div>
    </div>
  );
}