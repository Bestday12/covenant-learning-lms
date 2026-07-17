import { useState, useCallback } from "react";
import { updateCourse, updateCourseModules, deleteCourse } from "@/features/admin/courses/api/coursesApi.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";

export function useCourseMutations({ onSuccess } = {}) {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveModules = useCallback(async (courseId, modules) => {
    setIsSaving(true);
    try {
      await updateCourseModules(courseId, modules);
      showToast("Modules saved successfully", "success");
      onSuccess?.("modules");
    } catch (err) {
      showToast(err.message || "Failed to save modules", "error");
    } finally {
      setIsSaving(false);
    }
  }, [showToast, onSuccess]);

  const saveCourse = useCallback(async (courseId, updates) => {
    setIsSaving(true);
    try {
      const result = await updateCourse(courseId, updates);
      showToast("Course saved successfully", "success");
      onSuccess?.("course", result);
      return result;
    } catch (err) {
      showToast(err.message || "Failed to save course", "error");
    } finally {
      setIsSaving(false);
    }
  }, [showToast, onSuccess]);

  const removeCourse = useCallback(async (courseId) => {
    setIsSaving(true);
    try {
      await deleteCourse(courseId);
      showToast("Course deleted", "success");
      onSuccess?.("delete");
    } catch (err) {
      showToast(err.message || "Failed to delete course", "error");
    } finally {
      setIsSaving(false);
    }
  }, [showToast, onSuccess]);

  return { saveModules, saveCourse, removeCourse, isSaving };
}
