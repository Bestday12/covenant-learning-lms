import { supabase } from "@/lib/supabase.js";
import covenantMarriage from "@/data/covenant_marriage_course.json";
import marriageCrisis from "@/data/marriage_crisis_survival_guide.json";
import preMarital from "@/data/pre_marital_masterclass.json";
import newlywedNavigation from "@/data/newlywed-navigation.json";
import sacredPurpose from "@/data/sacred-purpose-gods-design-for-marriage.json";

const LOCAL_COURSES = {
  "covenant-marriage-foundation": {
    id: "covenant-marriage-foundation",
    title: "Covenant Marriage Foundation",
    description: "A Christ-centred foundational course for building a strong marriage.",
    data: covenantMarriage,
  },
  "marriage-crisis-survival-guide": {
    id: "marriage-crisis-survival-guide",
    title: "Marriage Crisis Survival Guide",
    description: "A restoration course for marriages in serious distress.",
    data: marriageCrisis,
  },
  "pre-marital-masterclass": {
    id: "pre-marital-masterclass",
    title: "Pre-Marital Masterclass",
    description: "A discernment and preparation course for engaged and dating couples.",
    data: preMarital,
  },
  
  "newlywed-navigation": {
  id: "newlywed-navigation",
  title: "The Newlywed Navigation: Building Your First Year Strong",
  description: "The first year sets the tone for a lifetime. Build yours with wisdom.",
  data: newlywedNavigation,
},
"sacred-purpose-gods-design-for-marriage": {
  id: "sacred-purpose-gods-design-for-marriage",
  title: "Sacred Purpose: God's Design for Your Marriage",
  description: "Move from happy to holy. Discover God's deeper purpose for your covenant.",
  data: sacredPurpose,
},
};

/**
 * Ensure all local courses have their modules seeded into Supabase.
 * Safe to call multiple times — only updates rows where modules = '[]'.
 */
export async function seedCoursesToSupabase() {
  if (!supabase) return;
  for (const [id, course] of Object.entries(LOCAL_COURSES)) {
    // Only seed if modules column is still empty
    const { data } = await supabase
      .from("courses")
      .select("id, modules")
      .eq("id", id)
      .single();

    if (data && (!data.modules || data.modules.length === 0)) {
      await supabase
        .from("courses")
        .update({
          modules: course.data.modules,
          bonus_resources: course.data.bonuses ?? {},
        })
        .eq("id", id);
    }
  }
}

export async function fetchAllCourses() {
  if (supabase) {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) throw error;
    if (data?.length) {
      // Merge: if DB modules are empty, fill from local JSON
      return data.map((row) => {
        const local = LOCAL_COURSES[row.id];
        const modules =
          Array.isArray(row.modules) && row.modules.length > 0
            ? row.modules
            : local?.data?.modules ?? [];
        return { ...row, modules };
      });
    }
  }

  return Object.values(LOCAL_COURSES).map(({ id, title, description, data }) => ({
    id,
    title,
    description,
    modules: data.modules,
  }));
}

export async function fetchCourseById(courseId) {
  if (supabase) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (!error && data) {
      const local = LOCAL_COURSES[courseId];
      // Prefer DB modules if seeded, else fall back to local JSON
      const modules =
        Array.isArray(data.modules) && data.modules.length > 0
          ? data.modules
          : local?.data?.modules ?? [];
      return { ...data, modules };
    }
  }

  const local = LOCAL_COURSES[courseId];
  if (!local) throw new Error(`Course not found: ${courseId}`);
  return { id: local.id, title: local.title, description: local.description, ...local.data };
}

export async function fetchModule(courseId, moduleId) {
  const course = await fetchCourseById(courseId);
  const module = course.modules?.find((m) => m.moduleId === moduleId);
  if (!module) throw new Error(`Module not found: ${moduleId}`);
  return module;
}
