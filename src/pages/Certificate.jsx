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

const DEFAULTS = {
  bgColor: "#ffffff",
  textMid: "#6b5f7a",
  bodyFont: "Arial, sans-serif",
  showLogo: true,
  textDark: "#1a0a2e",
  cornerSize: 72,
  accentColor: "#c9960c",
  accentLight: "#e8b422",
  certifyText: "This is to certify that",
  cornerStyle: "triangle",
  headingFont: "Georgia, serif",
  primaryColor: "#3d0a6e",
  scriptureRef: "Ecclesiastes 4:9",
  scriptureText: "Two are better than one, because they have a good return for their labour.",
  showScripture: true,
  showWatermark: true,
  watermarkText: "CMH",
  completionText: "has successfully completed",
  instructorName: "Reverend Sam Adeyemi",
  secondaryColor: "#5a1a9a",
  institutionName: "Covenant Learning",
  instructorTitle: "Course Instructor",
  signatureUrl: null,
  showInnerBorder: true,
  certificateTitle: "Certificate of Completion",
  innerBorderColor: "#c9960c",
  outerBorderColor: "#3d0a6e",
  institutionTagline: "Biblical wisdom for every season of marriage",
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
  const [certSettings, setCertSettings] = useState(null);

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
        const { data } = await supabase.from("profiles").select("full_name, email, role").eq("id", user.id).single();
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
    async function fetchCert() {
      if (!user?.id || !courseId) return;
      try {
        const { data } = await supabase.from("certificates").select("certificate_number, issued_at").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
        if (data) {
          setCertRecord(data);
          const verifyUrl = `${LMS_URL}/verify/${data.certificate_number}`;
          const qr = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1, color: { dark: "#3d0a6e", light: "#ffffff" } });
          setQrDataUrl(qr);
        }
      } catch (err) {
        console.error("Failed to fetch certificate record:", err);
      }
    }
    fetchCert();
  }, [user?.id, courseId]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from("settings").select("value").eq("key", "certificate_settings").maybeSingle();
        if (data?.value) setCertSettings(data.value);
      } catch (err) {
        console.error("Failed to load certificate settings:", err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (isCourseComplete) {
      const fire = () => confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 }, colors: ["#c9960c", "#e8b422", "#f5d060", "#3d0a6e", "#5a1a9a", "#ffffff"] });
      fire(); setTimeout(fire, 500); setTimeout(fire, 1000);
    }
  }, [isCourseComplete]);

  const S = { ...DEFAULTS, ...certSettings };
  const studentName = getDisplayName(user, userProfile);
  const now = new Date();
  const dateString = `${now.getDate()} ${now.toLocaleDateString("en-GB", { month: "long" })} ${now.getFullYear()}`;

  const handleDownload = async () => {
    if (!certRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, backgroundColor: S.bgColor, useCORS: true, logging: false, letterRendering: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 3, canvas.height / 3] });
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
          style={{ background: `linear-gradient(135deg, ${S.primaryColor}, ${S.secondaryColor})` }}
          className="inline-flex items-center gap-2 rounded-full text-white px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg"
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

      {/* CERTIFICATE */}
      <div
        ref={certRef}
        style={{
          width: "100%",
          aspectRatio: "1.414 / 1",
          background: S.bgColor,
          position: "relative",
          overflow: "hidden",
          fontFamily: S.bodyFont,
        }}
      >
        {/* Corner triangles */}
        {S.cornerStyle === "triangle" && (
          <>
            {[
              { top: 0, left: 0, clip: "polygon(0 0, 100% 0, 0 100%)", gradient: "135deg" },
              { top: 0, right: 0, clip: "polygon(0 0, 100% 0, 100% 100%)", gradient: "225deg" },
              { bottom: 0, left: 0, clip: "polygon(0 0, 0 100%, 100% 100%)", gradient: "45deg" },
              { bottom: 0, right: 0, clip: "polygon(100% 0, 0 100%, 100% 100%)", gradient: "315deg" },
            ].map((c, i) => (
              <div key={i} style={{
                position: "absolute", width: S.cornerSize, height: S.cornerSize,
                top: c.top, left: c.left, right: c.right, bottom: c.bottom,
                background: `linear-gradient(${c.gradient}, ${S.primaryColor} 0%, ${S.secondaryColor} 100%)`,
                clipPath: c.clip,
              }} />
            ))}
          </>
        )}

        {/* Borders */}
        <div style={{ position: "absolute", inset: 14, border: `2px solid ${S.outerBorderColor}`, borderRadius: 3 }} />
        {S.showInnerBorder && <div style={{ position: "absolute", inset: 22, border: `1px solid ${S.innerBorderColor}`, borderRadius: 2, opacity: 0.55 }} />}
        <div style={{ position: "absolute", top: 34, left: 56, right: 56, height: 1, background: `linear-gradient(90deg,transparent,${S.accentColor},transparent)` }} />
        <div style={{ position: "absolute", bottom: 34, left: 56, right: 56, height: 1, background: `linear-gradient(90deg,transparent,${S.accentColor},transparent)` }} />

        {/* Watermark */}
        {S.showWatermark && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
            <p style={{ fontSize: 160, fontWeight: 900, color: S.primaryColor, opacity: 0.018, fontFamily: S.headingFont, userSelect: "none", letterSpacing: "-0.05em" }}>
              {S.watermarkText}
            </p>
          </div>
        )}

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "44px 80px", textAlign: "center" }}>

          {/* Logo */}
          {S.showLogo && (
            <img src="/logo.png" alt={S.institutionName} style={{ height: 40, width: "auto", objectFit: "contain", marginBottom: 5 }} onError={(e) => e.target.style.display = "none"} />
          )}

          {/* Institution */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: S.accentColor, marginBottom: 5, fontFamily: S.bodyFont }}>
            {S.institutionName.split("").join("\u00A0")}
          </p>

          {/* Decorative dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 1, background: S.accentColor, opacity: 0.5 }} />
            <div style={{ width: 5, height: 5, background: S.accentColor, borderRadius: "50%" }} />
            <div style={{ width: 5, height: 5, background: S.primaryColor, borderRadius: "50%" }} />
            <div style={{ width: 5, height: 5, background: S.accentColor, borderRadius: "50%" }} />
            <div style={{ width: 36, height: 1, background: S.accentColor, opacity: 0.5 }} />
          </div>

          {/* Certificate title */}
          <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: S.primaryColor, marginBottom: 12, lineHeight: 1.15, fontFamily: S.headingFont }}>
            {S.certificateTitle}
          </h1>

          {/* Certify text */}
          <p style={{ fontSize: 12, color: S.textMid, marginBottom: 8, fontFamily: S.bodyFont, letterSpacing: "0.04em", wordSpacing: "0.12em" }}>
            {S.certifyText}
          </p>

          {/* Student name */}
          <div style={{ marginBottom: 10, paddingBottom: 7, borderBottom: `2px solid ${S.primaryColor}`, display: "inline-block", minWidth: 280 }}>
            <p style={{ fontSize: "clamp(18px, 2.8vw, 30px)", fontWeight: 700, color: S.textDark, fontFamily: S.headingFont }}>
              {studentName}
            </p>
          </div>

          {/* Completion text */}
          <p style={{ fontSize: 12, color: S.textMid, marginBottom: 6, fontFamily: S.bodyFont, letterSpacing: "0.04em", wordSpacing: "0.12em" }}>
            {S.completionText}
          </p>

          {/* Course name */}
          <p style={{ fontSize: "clamp(13px, 2vw, 20px)", fontWeight: 700, color: S.accentColor, marginBottom: 5, fontFamily: S.headingFont }}>
            {course?.title}
          </p>

          {/* Course description */}
          <p style={{ fontSize: 10, color: S.textMid, maxWidth: 420, lineHeight: 1.6, marginBottom: 10, fontFamily: S.bodyFont, letterSpacing: "0.03em" }}>
            {course?.description}
          </p>

          {/* Scripture */}
          {S.showScripture && (
            <p style={{ fontSize: 10, color: S.primaryColor, opacity: 0.65, marginBottom: 16, fontFamily: S.bodyFont, letterSpacing: "0.04em", wordSpacing: "0.12em", maxWidth: 460 }}>
              "{S.scriptureText}" — {S.scriptureRef}
            </p>
          )}

          {/* Signatures row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 40, width: "100%", maxWidth: 580 }}>

            {/* Date */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: `1px solid ${S.primaryColor}`, paddingTop: 7, minWidth: 110 }}>
                <p style={{ fontSize: 12, color: S.primaryColor, fontWeight: 700, fontFamily: S.bodyFont, letterSpacing: "0.06em", wordSpacing: "0.1em" }}>{dateString}</p>
                <p style={{ fontSize: 8, color: S.textMid, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: S.bodyFont }}>Date of Completion</p>
              </div>
            </div>

            {/* Gold seal */}
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${S.accentColor}, ${S.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 3px", boxShadow: `0 4px 14px rgba(201,150,12,0.35)` }}>
                <span style={{ fontSize: 22 }}>🏆</span>
              </div>
              <p style={{ fontSize: 7, color: S.accentColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: S.bodyFont }}>Verified</p>
              {certRecord?.certificate_number && (
                <p style={{ fontSize: 7, color: S.textMid, marginTop: 2, fontFamily: S.bodyFont, letterSpacing: "0.05em" }}>
                  {certRecord.certificate_number}
                </p>
              )}
            </div>

            {/* Instructor + Signature */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: `1px solid ${S.primaryColor}`, paddingTop: 7, minWidth: 160 }}>
                {S.signatureUrl ? (
                  <div>
                    <img
                      src={S.signatureUrl}
                      alt="Signature"
                      style={{ height: 36, maxWidth: 160, objectFit: "contain", display: "block", margin: "0 auto 2px" }}
                    />
                    <p style={{ fontSize: 10, color: S.primaryColor, fontFamily: S.bodyFont, letterSpacing: "0.04em", fontWeight: 600 }}>
                      {S.instructorName}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: S.primaryColor, fontFamily: S.bodyFont, letterSpacing: "0.04em", wordSpacing: "0.1em", fontWeight: 600 }}>
                    {S.instructorName}
                  </p>
                )}
                <p style={{ fontSize: 8, color: S.textMid, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: S.bodyFont }}>
                  {S.instructorTitle}
                </p>
              </div>
            </div>

          </div>

          {/* QR Code */}
          {qrDataUrl && certRecord?.certificate_number && (
            <div style={{ position: "absolute", bottom: 44, right: 72, textAlign: "center" }}>
              <img src={qrDataUrl} alt="Verify QR" style={{ width: 56, height: 56 }} />
              <p style={{ fontSize: 6, color: S.textMid, marginTop: 2, fontFamily: S.bodyFont, letterSpacing: "0.03em" }}>
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
