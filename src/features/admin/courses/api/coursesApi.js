/**
 * coursesApi.js — rebuilt to use Supabase directly.
 * The original file imported non-existent REST client libs.
 * All admin course operations now go through supabase-js.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase.js";
import { fetchAllCourses, fetchCourseById } from "@/services/courseService.js";

// ─── Core CRUD ────────────────────────────────────────────────────────────────

export async function createCourse(courseData) {
  if (!supabase) throw new Error("Supabase not connected");
  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCourse(id, updates) {
  if (!supabase) throw new Error("Supabase not connected");
  const { data, error } = await supabase
    .from("courses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCourseModules(id, modules) {
  return updateCourse(id, { modules });
}

export async function deleteCourse(id) {
  if (!supabase) throw new Error("Supabase not connected");
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Re-export service helpers for convenience
export { fetchAllCourses, fetchCourseById };

// ─── React hooks ──────────────────────────────────────────────────────────────

export function useCourse(id, options = {}) {
  const { autoFetch = true } = options;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const course = await fetchCourseById(id);
      setData(course);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  return { data, isLoading, error, refetch: fetch };
}

export function useCourses(filters = {}, options = {}) {
  const { autoFetch = true } = options;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const courses = await fetchAllCourses();
      setData(courses);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  return { data, isLoading, error, refetch: fetch, total: data.length };
}

export function useCourseMutation(options = {}) {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (action, ...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const actionMap = {
          create: createCourse,
          update: updateCourse,
          delete: deleteCourse,
          updateModules: updateCourseModules,
        };
        const handler = actionMap[action];
        if (!handler) throw new Error(`Unknown action: ${action}`);
        const result = await handler(...args);
        onSuccess?.(result, action);
        return { success: true, data: result };
      } catch (err) {
        setError(err);
        onError?.(err, action);
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return { mutate, isLoading, error };
}

export default { createCourse, updateCourse, updateCourseModules, deleteCourse, fetchAllCourses, fetchCourseById };
