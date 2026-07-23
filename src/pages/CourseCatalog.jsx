import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchAllCourses } from "@/services/courseService.js";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import Button from "@/components/ui/Button.jsx";
import LoadingScreen from "@/components/ui/LoadingScreen.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { supabase } from "@/lib/supabase.js";
import { CheckCircle2 } from "lucide-react";
import CourseReviews, { AverageStars } from "@/components/ui/CourseReviews.jsx";



function CourseRatingSummary({ courseId }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    supabase
      .from("course_reviews")
      .select("rating")
      .eq("course_id", courseId)
      .then(({ data }) => {
        if (data?.length) {
          const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
          setStats({ average: avg, count: data.length });
        }
      });
  }, [courseId]);
  if (!stats) return null;
  return <AverageStars average={stats.average} count={stats.count} size={14} />;
}

async function fetchMyEnrollments(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data.map((e) => e.course_id);
}

async function enrollInCourse({ userId, courseId }) {
  if (!supabase) throw new Error("Not connected to database");
  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId });
  if (error) throw error;
}

export default function CourseCatalog() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchAllCourses,
  });

  const { data: enrolledIds = [] } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: () => fetchMyEnrollments(user?.id),
    enabled: !!user?.id,
  });

  const enrollMutation = useMutation({
    mutationFn: enrollInCourse,
    onSuccess: () => {
      showToast("Enrolled! Let's get started.", "success");
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses-full"] });
    },
    onError: (err) => {
      showToast(err.message || "Could not enroll", "error");
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <p className="text-red-500">Failed to load courses.</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-brand-800 mb-8">Course Catalog</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledIds.includes(course.id);
          return (
            <Card key={course.id}>
              <CardHeader title={course.title} subtitle={course.description} />
			  <div className="mt-3">
        <CourseRatingSummary courseId={course.id} />
      </div>
              <div className="mt-4 flex items-center gap-2">
                {isEnrolled ? (
                  <Link to={`/courses/${course.id}`}>
                    <Button size="sm" variant="secondary">
                      <CheckCircle2 size={14} /> Enrolled — Continue
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/checkout/${course.id}`}>
  <Button size="sm">Enrol Now</Button>
</Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
