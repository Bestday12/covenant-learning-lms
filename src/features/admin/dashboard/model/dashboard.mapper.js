export function mapDashboardMetrics(payload = {}) {
  return {
    totalUsers: payload.totalUsers ?? 0,
    totalCourses: payload.totalCourses ?? 0,
    linkedPartners: payload.linkedPartners ?? 0,
    pendingIssues: payload.pendingIssues ?? 0,
  };
}