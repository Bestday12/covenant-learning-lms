import { supabase } from "@/lib/supabase.js";

export async function syncProgressToBackend(userId, courseId, progressPayload) {
  if (!supabase) return { synced: false, reason: "offline-mode" };
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      course_id: courseId,
      progress: progressPayload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" }
  );
  if (error) throw error;
  return { synced: true };
}

export async function fetchProgressFromBackend(userId, courseId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_progress")
    .select("progress")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw error;
  return data?.progress || null;
}
