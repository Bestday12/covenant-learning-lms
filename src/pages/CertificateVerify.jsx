// src/pages/CertificateVerify.jsx
// Public page — no login required
// URL: /verify/:certificateNumber

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Award, Calendar, BookOpen, User } from "lucide-react";
import { supabase } from "@/lib/supabase.js";

export default function CertificateVerify() {
  const { certificateNumber } = useParams();
  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [data, setData] = useState(null);

  useEffect(() => {
    async function verify() {
      if (!certificateNumber) { setStatus("invalid"); return; }
      try {
        const { data: cert, error } = await supabase
  .from("certificates")
  .select("certificate_number, issued_at, course_id")
  .eq("certificate_number", certificateNumber.toUpperCase())
  .maybeSingle();

        if (error || !cert) {
          setStatus("invalid");
          return;
        }
        setData(cert);
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    }
    verify();
  }, [certificateNumber]);

  const issuedDate = data?.issued_at
    ? new Date(data.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #3d0a6e 0%, #5a1a9a 50%, #2a0550 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* Loading */}
        {status === "loading" && (
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "48px", textAlign: "center" }}>
            <Loader2 size={40} className="animate-spin text-indigo-400 mx-auto mb-4" />
            <p style={{ color: "#6b5f7a", fontSize: 15 }}>Verifying certificate...</p>
          </div>
        )}

        {/* Valid */}
        {status === "valid" && (
          <div style={{ background: "#ffffff", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
            {/* Gold top bar */}
            <div style={{ background: "linear-gradient(135deg, #c9960c, #e8b422)", height: 5 }} />

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #3d0a6e, #5a1a9a)", padding: "32px 40px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "rgba(201,150,12,0.2)", border: "2px solid rgba(201,150,12,0.5)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={32} color="#f5d060" />
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(245,208,96,0.8)" }}>COVENANT LEARNING</p>
              <h1 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#ffffff" }}>Certificate Verified</h1>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>This certificate is authentic and valid</p>
            </div>

            {/* Body */}
            <div style={{ padding: "32px 40px" }}>

              {/* Certificate number badge */}
              <div style={{ background: "#faf6ef", border: "1px solid rgba(201,150,12,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#c9960c", textTransform: "uppercase", letterSpacing: "1px" }}>Certificate Number</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#3d0a6e", fontFamily: "monospace", letterSpacing: "2px" }}>{data.certificate_number}</p>
              </div>

              {/* Details */}
              <div style={{ space: "y-4" }}>
                {[
                  { icon: User, label: "Awarded To", value: data.profiles?.full_name || data.profiles?.email || "Student" },
				  { icon: BookOpen, label: "Course Completed", value: cert?.course_id?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || data.course_id },
                  { icon: BookOpen, label: "Course Completed", value: data.courses?.title || data.course_id },
                  { icon: Calendar, label: "Date of Issue", value: issuedDate },
                  { icon: Award, label: "Issued By", value: "Covenant Learning · Covenant Marriage Help Limited" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 14, borderBottom: i < 3 ? "1px solid #f1f0f5" : "none", marginBottom: i < 3 ? 14 : 0 }}>
                    <div style={{ width: 36, height: 36, background: "#faf6ef", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon size={16} color="#c9960c" />
                    </div>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#c9960c", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: 14, color: "#1a0a2e", fontWeight: 600 }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ marginTop: 28, textAlign: "center" }}>
                <Link
                  to="/"
                  style={{ display: "inline-block", background: "linear-gradient(135deg, #3d0a6e, #5a1a9a)", color: "#ffffff", textDecoration: "none", padding: "12px 32px", borderRadius: 50, fontSize: 14, fontWeight: 700 }}
                >
                  Visit Covenant Learning
                </Link>
              </div>
            </div>

            {/* Gold bottom bar */}
            <div style={{ background: "linear-gradient(135deg, #c9960c, #e8b422)", height: 3 }} />
          </div>
        )}

        {/* Invalid */}
        {status === "invalid" && (
          <div style={{ background: "#ffffff", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ background: "linear-gradient(135deg, #991b1b, #dc2626)", padding: "32px 40px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <XCircle size={32} color="#ffffff" />
              </div>
              <h1 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#ffffff" }}>Certificate Not Found</h1>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>This certificate number could not be verified</p>
            </div>
            <div style={{ padding: "32px 40px", textAlign: "center" }}>
              <p style={{ color: "#6b5f7a", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
                The certificate number <strong style={{ color: "#1a0a2e" }}>{certificateNumber}</strong> does not match any record in our system. Please check the number and try again.
              </p>
              <p style={{ color: "#9d8fb0", fontSize: 13, marginBottom: 24 }}>
                If you believe this is an error, contact us at <a href="mailto:support@covenantmarriagehelp.com" style={{ color: "#3d0a6e" }}>support@covenantmarriagehelp.com</a>
              </p>
              <Link
                to="/"
                style={{ display: "inline-block", background: "#3d0a6e", color: "#ffffff", textDecoration: "none", padding: "12px 32px", borderRadius: 50, fontSize: 14, fontWeight: 700 }}
              >
                Go to Covenant Learning
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          © 2026 Covenant Marriage Help Limited · Certificate Verification System
        </p>
      </div>
    </div>
  );
}
