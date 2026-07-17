import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMetrics } from "../api/dashboardApi";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
    staleTime: 60_000,
  });
}