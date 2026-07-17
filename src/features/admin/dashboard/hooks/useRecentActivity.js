import { useQuery } from "@tanstack/react-query";

async function fetchRecentActivity() {
  return [
    { id: 1, message: "Admin workspace initialized.", timestamp: "Just now" },
    { id: 2, message: "Awaiting real audit log connection.", timestamp: "Pending" },
    { id: 3, message: "Replace placeholders with Supabase activity feed.", timestamp: "Next step" },
  ];
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: fetchRecentActivity,
    staleTime: 60_000,
  });
}