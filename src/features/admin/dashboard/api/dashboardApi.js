import { supabase } from "@/lib/supabase.js";

export async function fetchDashboardMetrics() {
  if (!supabase) {
    return {
      totalUsers: 0,
      totalCourses: 0,
      linkedPartners: 0,
      pendingIssues: 0,
    };
  }

  const [usersRes, coursesRes, partnersRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    // Count profiles that have a partner_id set (linked couples)
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("partner_id", "is", null),
  ]);

  if (usersRes.error) throw usersRes.error;
  if (coursesRes.error) throw coursesRes.error;
  // partnersRes error is non-fatal — gracefully degrade
  const linkedPartners = partnersRes.error ? 0 : (partnersRes.count ?? 0);

  return {
    totalUsers: usersRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    linkedPartners,
    pendingIssues: 0,
  };
}
