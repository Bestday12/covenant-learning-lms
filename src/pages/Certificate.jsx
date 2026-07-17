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

  const totalModules = course?.modules?.length || 0;
  const completedModules = course?.modules?.filter((m) =>
    isModuleComplete(courseId, m.moduleId)
  ).length || 0;
  const isCourseComplete = totalModules > 0 && completedModules === totalModules;

  // Fetch user profile to get full_name
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        } else if (error) {
          console.error("Error fetching user profile:", error);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setProfileLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    if (isCourseComplete) {
      const fire = () => {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.4 },
          colors: ["#c9960c", "#e8b422", "#3d0a6e", "#7c3aed"],
        });
      };
      fire();
      const t = setTimeout(fire, 400);
      return () => clearTimeout(t);
    }
  }, [isCourseComplete]);

  // Get student name — use getDisplayName with user and profile
  const studentName = getDisplayName(user, userProfile);

  const completionDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDownload = async () => {
    if (!certRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificate-${course?.title?.replace(/\s+/g, "-") || courseId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading || profileLoading) {
    return <div className="max-w-3xl mx-auto py-24 text-center text-brand-500">Loading certificate...</div>;
  }

  if (!isCourseComplete) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <Award className="mx-auto mb-4 text-brand-300" size={48} />
        <h1 className="font-serif text-2xl font-bold text-brand-800 mb-2">Certificate Not Yet Available</h1>
        <p className="text-brand-500 mb-6">
          Complete all {totalModules} modules of {course?.title} to unlock your certificate.
          You've completed {completedModules} of {totalModules} so far.
        </p>
        <Link
          to={`/learn/${courseId}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 font-medium hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-6">
        <Link to={`/learn/${courseId}`} className="text-sm text-brand-500 hover:text-brand-700 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to course
        </Link>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 text-white px-5 py-2.5 text-sm font-bold hover:bg-accent-600 transition-colors disabled:opacity-60"
        >
          <Download size={16} /> {generating ? "Generating..." : "Download PDF"}
        </button>
      </div>

      <div
        ref={certRef}
        className="bg-white border-[10px] border-double border-brand-700 rounded-lg p-16 text-center relative"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        <div className="absolute top-8 left-8 right-8 h-px bg-gold-400" />
        <div className="absolute bottom-8 left-8 right-8 h-px bg-gold-400" />

        <img src="/logo.png" alt="Covenant Learning" className="mx-auto mb-4 h-16 w-auto object-contain" />
        <p className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-2">
          Covenant Learning
        </p>
        <h1 className="font-serif text-3xl font-bold text-brand-800 mb-6">Certificate of Completion</h1>

        <p className="text-brand-500 text-sm mb-1">This certifies that</p>
        <p className="font-serif text-2xl font-bold text-brand-900 mb-6 border-b-2 border-brand-100 inline-block px-8 pb-2">
          {studentName}
        </p>

        <p className="text-brand-500 text-sm mb-1">has successfully completed</p>
        <p className="font-serif text-xl font-bold text-accent-600 mb-8">
          {course?.title}
        </p>

        <p className="text-brand-600 text-sm max-w-md mx-auto mb-10 leading-relaxed">
          {course?.description}
        </p>

        <div className="flex items-center justify-center gap-16 mt-8">
          <div className="text-center">
            <p className="font-serif text-sm text-brand-700 border-t border-brand-300 pt-2 px-6">
              {completionDate}
            </p>
            <p className="text-xs text-brand-400 mt-1">Date</p>
          </div>
          <div className="text-center">
            <p className="font-serif italic text-lg text-brand-700 border-t border-brand-300 pt-2 px-6">
              {course?.instructor || "Reverend Sam Adeyemi"}
            </p>
            <p className="text-xs text-brand-400 mt-1">Instructor</p>
          </div>
        </div>
      </div>
    </div>
  );
}