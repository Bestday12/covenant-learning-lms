// src/pages/Certificate.jsx
import { useParams, Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import { Download, Award, ArrowLeft, Share2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useProgressStore } from "@/store/progressStore.js";
import { fetchCourseById } from "@/services/courseService.js";
import { useQuery } from "@tanstack/react-query";
import { getDisplayName } from "@/utils/getDisplayName.js";
import { supabase } from "@/lib/supabase.js";

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

  // Load progress from Supabase
  useEffect(() => {
    if (user?.id && courseId) {
      loadProgressFromBackend(user.id, courseId);
    }
  }, [user?.id, courseId]);

  // Fetch user profile
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user?.id) { setProfileLoading(false); return; }
      try {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single();
        if (data) setUserProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchUserProfile();
  }, [user?.id]);

  // Confetti on completion
  useEffect(() => {
    if (isCourseComplete) {
      const fire = () => confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#c9960c", "#e8b422", "#f5d060", "#3d0a6e", "#5a1a9a", "#ffffff"],
      });
      fire();
      setTimeout(fire, 500);
      setTimeout(fire, 1000);
    }
  }, [isCourseComplete]);

  const studentName = getDisplayName(user, userProfile);
  const completionDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const handleDownload = async () => {
    if (!certRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 3, canvas.height / 3],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`Covenant-Learning-Certificate-${course?.title?.replace(/\s+/g, "-") || courseId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-full bg-[#3d0a6e] text-white px-6 py-2.5 text-sm font-bold hover:bg-[#5a1a9a] transition-colors disabled:opacity-60 shadow-lg"
          >
            <Download size={16} />
            {generating ? "Generating PDF..." : "Download Certificate"}
          </button>
        </div>
      </div>

      {/* Congratulations banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
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
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Purple corner accents */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 80, height: 80, background: "linear-gradient(135deg, #3d0a6e 0%, #5a1a9a 100%)", clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "linear-gradient(225deg, #3d0a6e 0%, #5a1a9a 100%)", clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 80, height: 80, background: "linear-gradient(45deg, #3d0a6e 0%, #5a1a9a 100%)", clipPath: "polygon(0 0, 0 100%, 100% 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, background: "linear-gradient(315deg, #3d0a6e 0%, #5a1a9a 100%)", clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />

        {/* Outer border */}
        <div style={{ position: "absolute", inset: 16, border: "2px solid #3d0a6e", borderRadius: 4 }} />

        {/* Gold inner border */}
        <div style={{ position: "absolute", inset: 24, border: "1px solid #c9960c", borderRadius: 2, opacity: 0.6 }} />

        {/* Gold top line */}
        <div style={{ position: "absolute", top: 36, left: 60, right: 60, height: 1, background: "linear-gradient(90deg, transparent, #c9960c, transparent)" }} />

        {/* Gold bottom line */}
        <div style={{ position: "absolute", bottom: 36, left: 60, right: 60, height: 1, background: "linear-gradient(90deg, transparent, #c9960c, transparent)" }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "60px 80px", textAlign: "center" }}>

          {/* Logo area */}
          <div style={{ marginBottom: 8 }}>
            <img
              src="/logo.png"
              alt="Covenant Learning"
              style={{ height: 52, width: "auto", objectFit: "contain", marginBottom: 4 }}
              onError={(e) => e.target.style.display = "none"}
            />
          </div>

          {/* Institution name */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9960c", marginBottom: 4, fontFamily: "Arial, sans-serif" }}>
            Covenant Learning
          </p>

          {/* Decorative divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: "#c9960c", opacity: 0.5 }} />
            <div style={{ width: 6, height: 6, background: "#c9960c", borderRadius: "50%", opacity: 0.7 }} />
            <div style={{ width: 40, height: 1, background: "#c9960c", opacity: 0.5 }} />
          </div>

          {/* Certificate title */}
          <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#3d0a6e", marginBottom: 16, lineHeight: 1.2, fontFamily: "Georgia, serif" }}>
            Certificate of Completion
          </h1>

          {/* Certifies that */}
          <p style={{ fontSize: 13, color: "#6b5f7a", marginBottom: 8, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            This is to certify that
          </p>

          {/* Student name */}
          <div style={{ marginBottom: 16, padding: "8px 48px", borderBottom: "2px solid #3d0a6e", display: "inline-block" }}>
            <p style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 700, color: "#1a0a2e", fontFamily: "Georgia, serif", letterSpacing: "0.02em" }}>
              {studentName}
            </p>
          </div>

          {/* Has completed */}
          <p style={{ fontSize: 13, color: "#6b5f7a", marginBottom: 8, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            has successfully completed
          </p>

          {/* Course name */}
          <p style={{ fontSize: "clamp(14px, 2vw, 22px)", fontWeight: 700, color: "#c9960c", marginBottom: 8, fontFamily: "Georgia, serif" }}>
            {course?.title}
          </p>

          {/* Course description */}
          <p style={{ fontSize: 11, color: "#6b5f7a", maxWidth: 500, lineHeight: 1.6, marginBottom: 24, fontFamily: "Inter, sans-serif" }}>
            {course?.description}
          </p>

          {/* Scripture */}
          <p style={{ fontSize: 11, fontStyle: "italic", color: "#3d0a6e", opacity: 0.7, marginBottom: 24, fontFamily: "Georgia, serif" }}>
            "Two are better than one, because they have a good return for their labour." — Ecclesiastes 4:9
          </p>

          {/* Signatures row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 80, marginTop: 8, width: "100%", maxWidth: 560 }}>
            {/* Date */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #3d0a6e", paddingTop: 8, minWidth: 120 }}>
                <p style={{ fontSize: 13, color: "#3d0a6e", fontWeight: 600, fontFamily: "Georgia, serif" }}>
                  {completionDate}
                </p>
                <p style={{ fontSize: 10, color: "#6b5f7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>
                  Date of Completion
                </p>
              </div>
            </div>

            {/* Gold seal */}
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #c9960c, #e8b422)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", boxShadow: "0 4px 12px rgba(201,150,12,0.3)" }}>
                <span style={{ fontSize: 20 }}>🏆</span>
              </div>
              <p style={{ fontSize: 9, color: "#c9960c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "Inter, sans-serif" }}>
                Verified
              </p>
            </div>

            {/* Instructor */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #3d0a6e", paddingTop: 8, minWidth: 140 }}>
                <p style={{ fontSize: 13, color: "#3d0a6e", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                  {course?.instructor || "Reverend Sam Adeyemi"}
                </p>
                <p style={{ fontSize: 10, color: "#6b5f7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>
                  Course Instructor
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Subtle background watermark */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
          <p style={{ fontSize: 160, fontWeight: 900, color: "#3d0a6e", opacity: 0.015, fontFamily: "Georgia, serif", userSelect: "none" }}>
            CMH
          </p>
        </div>
      </div>

      {/* Share encouragement */}
      <div className="mt-8 text-center">
        <p className="text-brand-500 text-sm mb-2">
          Share your achievement with your community 🙏
        </p>
        <p className="text-brand-400 text-xs">
          Completed: <strong className="text-brand-600">{course?.title}</strong> · {completionDate}
        </p>
      </div>

    </div>
  );
}
