import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/services/courseService.js";
import ModuleList from "@/features/courses/ModuleList.jsx";
import { useProgressStore } from "@/store/progressStore.js";
import ProgressBar from "@/components/ui/ProgressBar.jsx";
import LoadingScreen from "@/components/ui/LoadingScreen.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { supabase } from "@/lib/supabase.js";
import Button from "@/components/ui/Button.jsx";
import { Lock } from "lucide-react";
import { useEffect } from "react";

async function checkEnrollment(userId, courseId) {
  if (!supabase || !userId) return false;
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export default function Course() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(courseId),
  });

  const { data: isEnrolled, isLoading: checkingEnrollment } = useQuery({
    queryKey: ["enrollment-check", user?.id, courseId],
    queryFn: () => checkEnrollment(user?.id, courseId),
    enabled: !!user?.id,
  });

  const getCourseProgress = useProgressStore((s) => s.getCourseProgress);
  const loadProgressFromBackend = useProgressStore((s) => s.loadProgressFromBackend);

  useEffect(() => {
    if (user?.id && courseId) {
      loadProgressFromBackend(user.id, courseId);
    }
  }, [user?.id, courseId, loadProgressFromBackend]);

  if (isLoading || checkingEnrollment) return <LoadingScreen />;
  if (error) return <p className="text-red-500">Course not found.</p>;

  if (!isEnrolled) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <Lock className="mx-auto mb-4 text-brand-300" size={40} />
        <h1 className="font-serif text-2xl font-bold text-brand-800 mb-2">
          You're Not Enrolled Yet
        </h1>
        <p className="text-brand-500 mb-6">
          Enroll in {course.title} from the catalog to access its modules and worksheets.
        </p>
        <Link to="/courses-catalog">
          <Button>Go to Course Catalog</Button>
        </Link>
      </div>
    );
  }

  const modules = course.modules || [];
  const percent = getCourseProgress(courseId, modules.length);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-brand-800 mb-2">{course.title}</h1>
      <p className="text-brand-500 mb-6">{course.description}</p>
      <div className="mb-8 max-w-sm">
        <ProgressBar value={percent} label="Course Progress" />
      </div>
      <ModuleList courseId={courseId} modules={modules} />
    </div>
  );
}