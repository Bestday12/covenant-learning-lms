// src/pages/Dashboard.jsx
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/services/courseService.js";
import CourseProgressCard from "@/features/dashboard/CourseProgressCard.jsx";
import SkeletonCard from "@/components/ui/SkeletonCard.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { supabase } from "@/lib/supabase.js";
import { Link } from "react-router-dom";
import { BookOpen, Settings, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useProgressStore } from "@/store/progressStore.js";

async function fetchMyEnrolledCourseIds(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data.map((e) => e.course_id);
}

export default function Dashboard() {
  const { user, profile } = useAuth();

  // Get first name from profile full_name, or from email
  const fullName = profile?.full_name || user?.user_metadata?.full_name || "";
  const firstName = fullName.split(" ")[0] || user?.email?.split("@")[0] || "friend";

  // Check if user was created via Stripe purchase (has temp password)
  const createdViaStripe = user?.user_metadata?.created_via === "stripe_purchase";

  const { data: enrolledIds, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: () => fetchMyEnrolledCourseIds(user?.id),
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to get fresh enrollment data
  });

   const loadProgressFromBackend = useProgressStore((s) => s.loadProgressFromBackend);

  useEffect(() => {
    if (user?.id && enrolledIds?.length) {
      enrolledIds.forEach((courseId) => {
        loadProgressFromBackend(user.id, courseId);
      });
    }
  }, [user?.id, enrolledIds, loadProgressFromBackend]);
  
  const { data: fullCourses, isLoading: loadingFull } = useQuery({
    queryKey: ["courses-full", enrolledIds],
    queryFn: async () => {
      const results = await Promise.all(
        enrolledIds.map((id) => fetchCourseById(id))
      );
      return results;
    },
    enabled: !!enrolledIds?.length,
  });

  const isBusy = loadingEnrollments || (enrolledIds?.length > 0 && loadingFull);

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-800 mb-1">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-brand-500">
          {enrolledIds?.length
            ? "Continue your marriage journey."
            : "Your covenant journey is ready to begin."}
        </p>
      </div>

      {/* Temp password warning banner */}
      {createdViaStripe && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Please update your password
            </p>
            <p className="text-sm text-amber-700">
              You're using a temporary password. Update it now to secure your account.
            </p>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <Settings size={14} />
            Update Password
          </Link>
        </div>
      )}

      {/* Course grid */}
      {isBusy ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : fullCourses?.length ? (
        <div className="grid md:grid-cols-3 gap-6">
          {fullCourses.map((course) => (
            <CourseProgressCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-brand-200 rounded-2xl">
          <BookOpen size={40} className="text-brand-300 mx-auto mb-4" />
          <p className="font-serif text-xl font-bold text-brand-700 mb-2">
            Your courses will appear here
          </p>
          <p className="text-brand-500 text-sm mb-6 max-w-sm mx-auto">
            Once you enrol in a course, it will show here with your progress tracked automatically.
          </p>
          <Link
            to="/courses-catalog"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 font-medium hover:bg-brand-700 transition-colors"
          >
            <BookOpen size={16} />
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
