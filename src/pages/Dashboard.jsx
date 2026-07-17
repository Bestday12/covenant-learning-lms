import { useQuery } from "@tanstack/react-query";
import { fetchAllCourses, fetchCourseById } from "@/services/courseService.js";
import CourseProgressCard from "@/features/dashboard/CourseProgressCard.jsx";
import SkeletonCard from "@/components/ui/SkeletonCard.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { supabase } from "@/lib/supabase.js";

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
  const { user } = useAuth();

  const { data: enrolledIds, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: () => fetchMyEnrolledCourseIds(user?.id),
    enabled: !!user?.id,
  });

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
      <h1 className="font-serif text-3xl font-bold text-brand-800 mb-2">
        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>
      <p className="text-brand-500 mb-8">Continue your marriage preparation journey.</p>

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
          <p className="text-brand-500 mb-4">You haven't enrolled in a course yet.</p>
          <a href="/courses-catalog" className="inline-block rounded-full bg-brand-600 text-white px-6 py-3 font-medium hover:bg-brand-700 transition-colors">
            Browse Courses
          </a>
        </div>
      )}
    </div>
  );
}