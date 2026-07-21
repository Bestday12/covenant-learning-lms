import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncProgressToBackend } from "@/services/progressService.js";
import { supabase } from "@/lib/supabase.js";

// Debounce sync to avoid hammering Supabase on rapid completions
const syncTimers = {};
function debouncedSync(userId, courseId, progressPayload, delay = 1500) {
  const key = `${userId}:${courseId}`;
  if (syncTimers[key]) clearTimeout(syncTimers[key]);
  syncTimers[key] = setTimeout(() => {
    syncProgressToBackend(userId, courseId, progressPayload).catch((err) =>
      console.warn("[progressStore] sync failed:", err)
    );
  }, delay);
}

export const useProgressStore = create(
  persist(
    (set, get) => ({
      // shape: { [courseId]: { [moduleId]: { completed: bool, completedAt, answers: {} } } }
      progress: {},

      markModuleComplete: async (userId, courseId, moduleId) => {
  // Get existing progress from store
  const currentProgress = get().progress[courseId] || {};

  // Merge new completion with existing progress
  const updatedProgress = {
    ...currentProgress,
    [moduleId]: {
      completed: true,
      completedAt: new Date().toISOString(),
    },
  };

  // Update local store
  set((state) => ({
    progress: {
      ...state.progress,
      [courseId]: updatedProgress,
    },
  }));

  // Save FULL merged progress to Supabase immediately (no debounce)
  if (userId && courseId) {
    try {
      await syncProgressToBackend(userId, courseId, updatedProgress);
      console.log(`✅ Progress saved: ${courseId} / ${moduleId}`);
    } catch (err) {
      console.error("❌ Failed to save progress:", err);
    }
  }
},
          // Fire-and-forget sync to Supabase
          const userId = supabase?.auth?.getUser
            ? undefined // will be resolved async below
            : null;
          if (supabase) {
            supabase.auth.getUser().then(({ data }) => {
              if (data?.user?.id) {
                debouncedSync(data.user.id, courseId, next[courseId]);
              }
            });
          }
          return { progress: next };
        });
      },

      saveWorksheetAnswers: (courseId, moduleId, worksheetId, answers) => {
        set((state) => {
          const next = {
            ...state.progress,
            [courseId]: {
              ...state.progress[courseId],
              [moduleId]: {
                ...(state.progress[courseId]?.[moduleId] || {}),
                answers: {
                  ...(state.progress[courseId]?.[moduleId]?.answers || {}),
                  [worksheetId]: answers,
                },
              },
            },
          };
          if (supabase) {
            supabase.auth.getUser().then(({ data }) => {
              if (data?.user?.id) {
                debouncedSync(data.user.id, courseId, next[courseId]);
              }
            });
          }
          return { progress: next };
        });
      },

      // Load progress from Supabase (call on login / course open)
      loadProgressFromBackend: async (userId, courseId) => {
        if (!supabase || !userId) return;
        try {
          const { data, error } = await supabase
            .from("user_progress")
            .select("progress")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .maybeSingle();
          if (error || !data?.progress) return;
          set((state) => ({
            progress: {
              ...state.progress,
              [courseId]: {
                // Merge — remote wins for completed flags, local wins for in-flight answers
                ...data.progress,
                ...state.progress[courseId],
              },
            },
          }));
        } catch (err) {
          console.warn("[progressStore] loadProgressFromBackend failed:", err);
        }
      },

      getCourseProgress: (courseId, totalModules) => {
        const state = get();
        const courseData = state.progress[courseId] || {};
        const completedCount = Object.values(courseData).filter(
          (m) => m.completed
        ).length;
        return totalModules > 0
          ? Math.round((completedCount / totalModules) * 100)
          : 0;
      },

      isModuleComplete: (courseId, moduleId) => {
        const state = get();
        return !!state.progress?.[courseId]?.[moduleId]?.completed;
      },
    }),
    { name: "progress-storage" }
  )
);
