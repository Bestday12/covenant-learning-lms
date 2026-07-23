// src/features/admin/dashboard/api/dashboardApi.js
import { supabase } from "@/lib/supabase.js";

export async function fetchDashboardMetrics() {
  if (!supabase) return { totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalRevenue: 0, completionRate: 0 };

  const [usersRes, coursesRes, enrollmentsRes, progressRes, certificatesRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("id", { count: "exact", head: true }),
    supabase.from("user_progress").select("id", { count: "exact", head: true }),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
  ]);

  // Revenue from courses table prices × enrollments per course
  const { data: revenueData } = await supabase
    .from("enrollments")
    .select("course_id, courses(price)");

  const totalRevenue = (revenueData || []).reduce((sum, e) => {
    return sum + (e.courses?.price || 0);
  }, 0);

  const totalEnrollments = enrollmentsRes.count ?? 0;
  const totalCertificates = certificatesRes.count ?? 0;
  const completionRate = totalEnrollments > 0
    ? Math.round((totalCertificates / totalEnrollments) * 100)
    : 0;

  return {
    totalUsers: usersRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    totalEnrollments,
    totalRevenue,
    completionRate,
    totalCertificates,
  };
}

export async function fetchEnrollmentsByCourse() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id, courses(title, price)");

  if (error) throw error;

  // Group by course
  const courseMap = {};
  for (const e of data || []) {
    const id = e.course_id;
    if (!courseMap[id]) {
      courseMap[id] = {
        courseId: id,
        title: e.courses?.title || id,
        price: e.courses?.price || 0,
        enrollments: 0,
        revenue: 0,
      };
    }
    courseMap[id].enrollments += 1;
    courseMap[id].revenue += e.courses?.price || 0;
  }

  return Object.values(courseMap).sort((a, b) => b.enrollments - a.enrollments);
}

export async function fetchRecentEnrollments(limit = 8) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("id, enrolled_at, course_id, user_id, courses(title), profiles(full_name, email)")
    .order("enrolled_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchRecentActivity() {
  return fetchRecentEnrollments(5);
}
