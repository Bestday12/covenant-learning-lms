import { useState, useEffect, useCallback } from "react";
import { fetchAllCourses } from "@/services/courseService.js";

export function useCourses() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const courses = await fetchAllCourses();
      setData(courses);
    } catch (err) {
      console.error("[useCourses]", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, isLoading, isError, refetch: load };
}
