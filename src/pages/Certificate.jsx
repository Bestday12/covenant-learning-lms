// src/pages/Certificate.jsx
import { useParams, Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import { Download, Award, ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useProgressStore } from "@/store/progressStore.js";
import { fetchCourseById } from "@/services/courseService.js";
import { useQuery } from "@tanstack/react-query";
import { getDisplayName } from "@/utils/getDisplayName.js";
import { supabase } from "@/lib/supabase.js";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const LMS_URL = "https://learn.covenantmarriagehelp.com";

const F = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Arial, Helvetica, sans-serif",
};

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const certRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [certRecord, setCertRecord] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId,
  });

  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);
  const loadProgressFromBackend = useProgressStore((s) => s.loadProgressFromBackend);

  const totalModules = course?.modules?.length || 0;
  const completedModules = course?.modules?.filter((m) =>
    isModuleComplete(courseId, m.moduleId)
  ).length || 0;
  const isCourseComplete = totalModules > 0 && completedModules === totalModules;

  useEffect(() => {
    if (user?.id && courseId) loadProgressFromBackend(user.id, courseId);
  }, [user?.id, courseId]);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) { setProfileLoading(false); return; }
      try {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single();
        if (data) setUserProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user?.id]);

  // Fetch certificate record (for number)
  useEffect(() => {
    async function fetchCert() {
      if (!user?.id || !courseId) return;
      try {
        const { data } = await supabase
          .from("certificates")
          .select("certificate_number, issued_at")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .maybeSingle();
        if (data) {
          setCertRecord(data);
          // Generate QR code
          const verifyUrl = `${LMS_URL}/verify/${data.certificate_number}`;
          const qr = await QRCode.toDataURL(verifyUrl, {
            width: 120,
            margin: 1,
            color: { dark: "#3d0a6e", light: "#ffffff" },
          });
          setQrDataUrl(qr);
        }
      } catch (err) {
        console.error("Failed to fetch certificate record:", err);
      }
    }
    fetchCert();
  }, [user?.id, courseId]);

  // Confetti
  useEffect(() => {
    if (isCourseComplete) {
      const fire = () => confetti({
        particleCount: 150, spread: 100, origin: { y: 0.4 },
        colors: ["#c9960c", "#e8b422", "#f5d060", "#3d0a6e", "#5a1a9a", "#ffffff"],
      });
      fire(); setTimeout(fire, 500); setTimeout(fire, 1000);
    }
  }, [isCourseComplete]);

  const studentName = getDisplayName(user, userProfile);

  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-GB", { month: "long" });
  const year = now.getFullYear();
  const dateString = `${day} ${month} ${year}`;

  const handleDownload = async () => {
    if (!certRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        letterRendering: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 3, canvas.height / 3],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`Covenant-Learning-Certificate-${course?.title?.replace(/\s+/g, "-") || courseId}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
        <p className="text-brand-500">Preparing your certificate...</p>
      </div>
    );
  }

  if (!isCourseComplete) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center px-6">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
          <Award className="text-brand-400" size={40} />
        </div>
        <h1 className="font-serif text-2xl font-bold text-brand-800 mb-3">Certificate Not Yet Available</h1>
        <p className="text-brand-500 mb-2">Complete all {totalModules} modules of <strong>{course?.title}</strong> to unlock your certificate.</p>
        <p className="text-brand-400 text-sm mb-8">{completedModules} of {totalModules} modules completed</p>
        <div className="w-full bg-brand-100 rounded-full h-2 mb-8 max-w-xs mx-auto">
          <div className="bg-accent-500 h-2 rounded-full transition-all" style={{ width: `${totalModules > 0 ? (completedModules / totalModules) * 100 : 0}%` }} />
        </div>
        <Link to={`/learn/${courseId}`} className="inline-flex items-center gap-2 rounded-full bg-brand-700 text-white px-6 py-3 font-medium hover:bg-brand-800 transition-colors">
          <ArrowLeft size={16} /> Continue Course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">

      {/* Action bar */}
      <div className="flex items-center justify-between mb-8">
        <Link to={`/learn/${courseId}`} className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-700 transition-colors">
          <ArrowLeft size={14} /> Back to course
        </Link>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full bg-[#3d0a6e] text-white px-6 py-2.5 text-sm font-bold hover:bg-[#5a1a9a] transition-colors disabled:opacity-60 shadow-lg"
        >
          <Download size={16} />
          {generating ? "Generating PDF..." : "Download Certificate"}
        </button>
      </div>

      {/* Congratulations banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-2">
          🎉 Congratulations on completing the course!
        </div>
        {certRecord?.certificate_number && (
          <p className="text-brand-400 text-xs mt-1">
            Certificate Number: <span className="font-mono font-bold text-brand-600">{certRecord.certificate_number}</span>
          </p>
        )}
      </div>

      {/* ── CERTIFICATE ── */}
      <div
        ref={certRef}
        style={{
          width: "100%",
          aspectRatio: "1.414 / 1",
          background: "#ffffff",
          position: "relative",
          overflow: "hidden",
          fontFamily: F.sans,
        }}
      >
        {/* Purple corner triangles */}
        {[
          { top: 0, left: 0, clip: "polygon(0 0, 100% 0, 0 100%)", gradient: "135deg" },
          { top: 0, right: 0, clip: "polygon(0 0, 100% 0, 100% 100%)", gradient: "225deg" },
          { bottom: 0, left: 0, clip: "polygon(0 0, 0 100%, 100% 100%)", gradient: "45deg" },
          { bottom: 0, right: 0, clip: "polygon(100% 0, 0 100%, 100% 100%)", gradient: "315deg" },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", width: 72, height: 72,
            top: s.top, left: s.left, right: s.right, bottom: s.bottom,
            background: `linear-gradient(${s.gradient}, #3d0a6e 0%, #5a1a9a 100%)`,
            clipPath: s.clip,
          }} />
        ))}

        {/* Borders */}
        <div style={{ position: "absolute", inset: 14, border: "2px solid #3d0a6e", borderRadius: 3 }} />
        <div style={{ position: "absolute", inset: 22, border: "1px solid #c9960c", borderRadius: 2, opacity: 0.55 }} />
        <div style={{ position: "absolute", top: 34, left: 56, right: 56, height: 1, background: "linear-gradient(90deg,transparent,#c9960c,transparent)" }} />
        <div style={{ position: "absolute", bottom: 34, left: 56, right: 56, height: 1, background: "linear-gradient(90deg,transparent,#c9960c,transparent)" }} />

        {/* Watermark */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
          <p style={{ fontSize: 160, fontWeight: 900, color: "#3d0a6e", opacity: 0.018, fontFamily: F.serif, userSelect: "none", letterSpacing: "-0.05em" }}>CMH</p>
        </div>

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "44px 80px", textAlign: "center" }}>

          {/* Logo */}
          <img src="/logo.png" alt="Covenant Learning" style={{ height: 40, width: "auto", objectFit: "contain", marginBottom: 5 }} onError={(e) => e.target.style.display = "none"} />

          {/* Institution */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c9960c", marginBottom: 5, fontFamily: F.sans }}>
            COVENANT&nbsp;&nbsp;LEARNING
          </p>

          {/* Decorative dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 1, background: "#c9960c", opacity: 0.5 }} />
            <div style={{ width: 5, height: 5, background: "#c9960c", borderRadius: "50%" }} />
            <div style={{ width: 5, height: 5, background: "#3d0a6e", borderRadius: "50%" }} />
            <div style={{ width: 5, height: 5, background: "#c9960c", borderRadius: "50%" }} />
            <div style={{ width: 36, height: 1, background: "#c9960c", opacity: 0.5 }} />
          </div>

          {/* Certificate title */}
          <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#3d0a6e", marginBottom: 12, lineHeight: 1.15, fontFamily: F.serif }}>
            Certificate of Completion
          </h1>

          <p style={{ fontSize: 12, color: "#6b5f7a", marginBottom: 8, fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.12em" }}>
            This is to certify that
          </p>

          {/* Student name */}
          <div style={{ marginBottom: 10, paddingBottom: 7, borderBottom: "2px solid #3d0a6e", display: "inline-block", minWidth: 280 }}>
            <p style={{ fontSize: "clamp(18px, 2.8vw, 30px)", fontWeight: 700, color: "#1a0a2e", fontFamily: F.serif }}>
              {studentName}
            </p>
          </div>

          <p style={{ fontSize: 12, color: "#6b5f7a", marginBottom: 6, fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.12em" }}>
            has successfully completed
          </p>

          <p style={{ fontSize: "clamp(13px, 2vw, 20px)", fontWeight: 700, color: "#c9960c", marginBottom: 5, fontFamily: F.serif }}>
            {course?.title}
          </p>

          <p style={{ fontSize: 10, color: "#6b5f7a", maxWidth: 420, lineHeight: 1.6, marginBottom: 10, fontFamily: F.sans, letterSpacing: "0.03em" }}>
            {course?.description}
          </p>

          {/* Scripture */}
          <p style={{ fontSize: 10, color: "#3d0a6e", opacity: 0.65, marginBottom: 16, fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.12em", maxWidth: 460 }}>
            "Two are better than one, because they have a good return for their labour." — Ecclesiastes 4:9
          </p>

          {/* Signatures row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 40, width: "100%", maxWidth: 580 }}>

            {/* Date */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #3d0a6e", paddingTop: 7, minWidth: 110 }}>
                <p style={{ fontSize: 12, color: "#3d0a6e", fontWeight: 700, fontFamily: F.sans, letterSpacing: "0.06em", wordSpacing: "0.1em" }}>{dateString}</p>
                <p style={{ fontSize: 8, color: "#6b5f7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: F.sans }}>Date of Completion</p>
              </div>
            </div>

            {/* Gold seal + QR */}
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #c9960c, #e8b422)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 3px", boxShadow: "0 4px 14px rgba(201,150,12,0.35)" }}>
                <span style={{ fontSize: 22 }}>🏆</span>
              </div>
              <p style={{ fontSize: 7, color: "#c9960c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: F.sans }}>Verified</p>
              {/* Certificate number */}
              {certRecord?.certificate_number && (
                <p style={{ fontSize: 7, color: "#6b5f7a", marginTop: 2, fontFamily: F.sans, letterSpacing: "0.05em" }}>
                  {certRecord.certificate_number}
                </p>
              )}
            </div>

            {/* Instructor */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #3d0a6e", paddingTop: 7, minWidth: 160 }}>
                <p style={{ fontSize: 12, color: "#3d0a6e", fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.1em", fontWeight: 600 }}>
                  Reverend Sam Adeyemi
                </p>
                <p style={{ fontSize: 8, color: "#6b5f7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: F.sans }}>
                  Course Instructor
                </p>
              </div>
            </div>

          </div>

          {/* QR Code + verification URL */}
          {qrDataUrl && certRecord?.certificate_number && (
            <div style={{ position: "absolute", bottom: 44, right: 72, textAlign: "center" }}>
              <img src={qrDataUrl} alt="Verify QR" style={{ width: 56, height: 56 }} />
              <p style={{ fontSize: 6, color: "#6b5f7a", marginTop: 2, fontFamily: F.sans, letterSpacing: "0.03em" }}>
                Scan to verify
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Verification link */}
      {certRecord?.certificate_number && (
        <div className="mt-6 text-center">
          <p className="text-brand-400 text-xs mb-1">
            Certificate Number: <span className="font-mono font-bold text-brand-600">{certRecord.certificate_number}</span>
          </p>
          <a
            href={`${LMS_URL}/verify/${certRecord.certificate_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline"
          >
            🔗 {LMS_URL}/verify/{certRecord.certificate_number}
          </a>
          <p className="text-brand-400 text-xs mt-1">
            Completed: <strong className="text-brand-600">{course?.title}</strong> · {dateString}
          </p>
        </div>
      )}

    </div>
  );
}
