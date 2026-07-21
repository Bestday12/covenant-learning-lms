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

// ── Safe font helper — all text uses Arial to avoid html2canvas kerning bugs ──
const F = {
  serif: "Georgia, 'Times New Roman', serif",   // large headings only
  sans: "Arial, Helvetica, sans-serif",          // everything else
};

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const certRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

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

  // Format date parts separately to avoid html2canvas word-spacing issues
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
        <h1 className="font-serif text-2xl font-bold text-brand-800 mb-3">
          Certificate Not Yet Available
        </h1>
        <p className="text-brand-500 mb-2">
          Complete all {totalModules} modules of <strong>{course?.title}</strong> to unlock your certificate.
        </p>
        <p className="text-brand-400 text-sm mb-8">
          {completedModules} of {totalModules} modules completed
        </p>
        <div className="w-full bg-brand-100 rounded-full h-2 mb-8 max-w-xs mx-auto">
          <div
            className="bg-accent-500 h-2 rounded-full transition-all"
            style={{ width: `${totalModules > 0 ? (completedModules / totalModules) * 100 : 0}%` }}
          />
        </div>
        <Link
          to={`/learn/${courseId}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 text-white px-6 py-3 font-medium hover:bg-brand-800 transition-colors"
        >
          <ArrowLeft size={16} /> Continue Course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">

      {/* Action bar */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to={`/learn/${courseId}`}
          className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-700 transition-colors"
        >
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
        <p className="text-brand-500 text-sm">Your certificate is ready to download and share.</p>
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
        {/* Purple corner triangles — smaller so they don't crowd content */}
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

        {/* Outer navy border */}
        <div style={{ position: "absolute", inset: 14, border: "2px solid #3d0a6e", borderRadius: 3 }} />

        {/* Inner gold border */}
        <div style={{ position: "absolute", inset: 22, border: "1px solid #c9960c", borderRadius: 2, opacity: 0.55 }} />

        {/* Gold top rule */}
        <div style={{ position: "absolute", top: 34, left: 56, right: 56, height: 1, background: "linear-gradient(90deg,transparent,#c9960c,transparent)" }} />

        {/* Gold bottom rule */}
        <div style={{ position: "absolute", bottom: 34, left: 56, right: 56, height: 1, background: "linear-gradient(90deg,transparent,#c9960c,transparent)" }} />

        {/* Background watermark */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
          <p style={{ fontSize: 160, fontWeight: 900, color: "#3d0a6e", opacity: 0.018, fontFamily: F.serif, userSelect: "none", letterSpacing: "-0.05em" }}>
            CMH
          </p>
        </div>

        {/* ── Main content ── */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "100%", padding: "52px 80px", textAlign: "center",
        }}>

          {/* Logo */}
          <img
            src="/logo.png"
            alt="Covenant Learning"
            style={{ height: 44, width: "auto", objectFit: "contain", marginBottom: 6 }}
            onError={(e) => e.target.style.display = "none"}
          />

          {/* Institution */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c9960c", marginBottom: 6, fontFamily: F.sans }}>
            COVENANT&nbsp;&nbsp;LEARNING
          </p>

          {/* Decorative dots + lines */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 1, background: "#c9960c", opacity: 0.5 }} />
            <div style={{ width: 5, height: 5, background: "#c9960c", borderRadius: "50%" }} />
            <div style={{ width: 5, height: 5, background: "#3d0a6e", borderRadius: "50%" }} />
            <div style={{ width: 5, height: 5, background: "#c9960c", borderRadius: "50%" }} />
            <div style={{ width: 36, height: 1, background: "#c9960c", opacity: 0.5 }} />
          </div>

          {/* Certificate of Completion */}
          <h1 style={{ fontSize: "clamp(26px, 4.2vw, 44px)", fontWeight: 700, color: "#3d0a6e", marginBottom: 14, lineHeight: 1.15, fontFamily: F.serif, letterSpacing: "-0.01em" }}>
            Certificate of Completion
          </h1>

          {/* This is to certify that */}
          <p style={{ fontSize: 13, color: "#6b5f7a", marginBottom: 10, fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.12em" }}>
            This is to certify that
          </p>

          {/* Student name */}
          <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #3d0a6e", display: "inline-block", minWidth: 280 }}>
            <p style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 700, color: "#1a0a2e", fontFamily: F.serif, letterSpacing: "0.01em" }}>
              {studentName}
            </p>
          </div>

          {/* Has successfully completed */}
          <p style={{ fontSize: 13, color: "#6b5f7a", marginBottom: 8, fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.12em" }}>
            has successfully completed
          </p>

          {/* Course name */}
          <p style={{ fontSize: "clamp(14px, 2.2vw, 22px)", fontWeight: 700, color: "#c9960c", marginBottom: 6, fontFamily: F.serif, letterSpacing: "0.02em" }}>
            {course?.title}
          </p>

          {/* Course description */}
          <p style={{ fontSize: 11, color: "#6b5f7a", maxWidth: 480, lineHeight: 1.65, marginBottom: 14, fontFamily: F.sans, letterSpacing: "0.03em", wordSpacing: "0.08em" }}>
            {course?.description}
          </p>

          {/* Scripture — Arial, no italic, explicit spacing */}
          <p style={{ fontSize: 11, color: "#3d0a6e", opacity: 0.65, marginBottom: 20, fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.12em", maxWidth: 500 }}>
            "Two are better than one, because they have a good return for their labour." — Ecclesiastes 4:9
          </p>

          {/* Signatures row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 72, width: "100%", maxWidth: 560 }}>

            {/* Date */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #3d0a6e", paddingTop: 8, minWidth: 110 }}>
                <p style={{ fontSize: 13, color: "#3d0a6e", fontWeight: 700, fontFamily: F.sans, letterSpacing: "0.06em", wordSpacing: "0.1em" }}>
                  {dateString}
                </p>
                <p style={{ fontSize: 9, color: "#6b5f7a", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: F.sans }}>
                  Date of Completion
                </p>
              </div>
            </div>

            {/* Gold seal */}
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(135deg, #c9960c, #e8b422)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 4px",
                boxShadow: "0 4px 14px rgba(201,150,12,0.35)",
              }}>
                <span style={{ fontSize: 22 }}>🏆</span>
              </div>
              <p style={{ fontSize: 8, color: "#c9960c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: F.sans }}>
                Verified
              </p>
            </div>

            {/* Instructor */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #3d0a6e", paddingTop: 8, minWidth: 140 }}>
                <p style={{ fontSize: 13, color: "#3d0a6e", fontFamily: F.sans, letterSpacing: "0.04em", wordSpacing: "0.1em", fontWeight: 600 }}>
                  {course?.instructor || "Reverend Sam Adeyemi"}
                </p>
                <p style={{ fontSize: 9, color: "#6b5f7a", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: F.sans }}>
                  Course Instructor
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Share note */}
      <div className="mt-8 text-center">
        <p className="text-brand-500 text-sm mb-1">Share your achievement with your community 🙏</p>
        <p className="text-brand-400 text-xs">
          Completed: <strong className="text-brand-600">{course?.title}</strong> · {dateString}
        </p>
      </div>

    </div>
  );
}
