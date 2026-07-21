// src/store/progressStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncProgressToBackend, fetchProgressFromBackend } from "@/services/progressService.js";

export const useProgressStore = create(
  persist(
    (set, get) => ({
      progress: {},

      markModuleComplete: async (userId, courseId, moduleId) => {
        const currentProgress = get().progress[courseId] || {};
        const updatedProgress = {
          ...currentProgress,
          [moduleId]: {
            completed: true,
            completedAt: new Date().toISOString(),
          },
        };
        set((state) => ({
          progress: { ...state.progress, [courseId]: updatedProgress },
        }));
        if (userId && courseId) {
          try {
            await syncProgressToBackend(userId, courseId, updatedProgress);
            console.log(`✅ Progress saved: ${courseId}/${moduleId} (${Object.keys(updatedProgress).length} modules)`);
          } catch (err) {
            console.error("❌ Failed to save progress:", err);
          }
        }
      },

      loadProgressFromBackend: async (userId, courseId) => {
        if (!userId || !courseId) return;
        try {
          const data = await fetchProgressFromBackend(userId, courseId);
          if (data) {
            set((state) => ({
              progress: { ...state.progress, [courseId]: data },
            }));
          }
        } catch (err) {
          console.error("❌ Failed to load progress:", err);
        }
      },

      isModuleComplete: (courseId, moduleId) => {
        const courseProgress = get().progress[courseId] || {};
        return !!courseProgress[moduleId]?.completed;
      },

      getCourseProgress: (courseId, totalModules) => {
        if (!totalModules) return 0;
        const courseProgress = get().progress[courseId] || {};
        const completedCount = Object.values(courseProgress).filter((m) => m?.completed).length;
        return Math.round((completedCount / totalModules) * 100);
      },

      saveWorksheetAnswers: async (userId, courseId, moduleId, answers) => {
        const currentProgress = get().progress[courseId] || {};
        const updatedProgress = {
          ...currentProgress,
          [moduleId]: { ...currentProgress[moduleId], worksheetAnswers: answers },
        };
        set((state) => ({
          progress: { ...state.progress, [courseId]: updatedProgress },
        }));
        if (userId && courseId) {
          try {
            await syncProgressToBackend(userId, courseId, updatedProgress);
          } catch (err) {
            console.error("❌ Failed to save worksheet answers:", err);
          }
        }
      },

      resetCourseProgress: (courseId) => {
        set((state) => {
          const newProgress = { ...state.progress };
          delete newProgress[courseId];
          return { progress: newProgress };
        });
      },
    }),
    {
      name: "covenant-learning-progress",
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);