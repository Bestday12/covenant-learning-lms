// src/features/admin/courses/pages/AdminCourseDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Layers3,
  PencilLine,
  Tag,
  Video,
} from "lucide-react";
import { supabase } from "@/lib/supabase.js";


function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClasses(status) {
  if (status === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "draft") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "archived") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function visibilityClasses(value) {
  if (value === "public") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "private") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  return "border-violet-200 bg-violet-50 text-violet-700";
}

function getModuleCount(modules) {
  return Array.isArray(modules) ? modules.length : 0;
}

function getLessonCount(modules) {
  if (!Array.isArray(modules)) return 0;
  // Each module has 5 lesson tabs.
  return modules.length * 5;
}

function getCurriculum(modules) {
  if (!Array.isArray(modules)) return [];

  return modules.map((moduleItem, index) => {
    const title =
      moduleItem?.title ||
      moduleItem?.name ||
      `Module ${index + 1}`;

    return {
      id: `${title}-${index}`,
      title,
      items: 5, // Each module has 5 lessons
    };
  });
}

function getOutcomes(modules) {
  if (!Array.isArray(modules)) return [];

  const collected = [];

  modules.forEach((moduleItem) => {
    if (Array.isArray(moduleItem?.outcomes)) {
      collected.push(...moduleItem.outcomes.filter(Boolean));
    }
  });

  return collected.slice(0, 6);
}

function mapCourseRow(row) {
  const modules = Array.isArray(row.modules) ? row.modules : [];
  const moduleCount = getModuleCount(modules);
  const lessonCount = getLessonCount(modules);
  const curriculum = getCurriculum(modules);
  const derivedOutcomes = getOutcomes(modules);

  return {
    id: row.id,
    slug: row.id,
    title: row.title || "Untitled course",
    description: row.description || "No description added yet.",
    status: "published",
    visibility: "public",
    category: "General",
    level: "Not set",
    price: 0,
    duration:
      moduleCount > 0
        ? `${moduleCount} module${moduleCount > 1 ? "s" : ""}`
        : "—",
    lessons: lessonCount,
    modules: moduleCount,
    instructor: "Not assigned",
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    outcomes:
      derivedOutcomes.length > 0
        ? derivedOutcomes
        : [
            "Review and refine this course structure.",
            "Add lesson content inside each module.",
            "Complete learner-facing metadata before publishing.",
          ],
    curriculum,
    bonusResources: row.bonus_resources ?? {},
  };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-[28px] bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[24px] bg-slate-100"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="h-52 animate-pulse rounded-[28px] bg-slate-100" />
          <div className="h-56 animate-pulse rounded-[28px] bg-slate-100" />
          <div className="h-64 animate-pulse rounded-[28px] bg-slate-100" />
        </div>
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-[28px] bg-slate-100" />
          <div className="h-64 animate-pulse rounded-[28px] bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function AdminCourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [courseRow, setCourseRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("courses")
          .select("id, title, description, modules, bonus_resources, created_at, updated_at")
          .eq("id", courseId)
          .single();

        if (error) throw error;

        setCourseRow(data);
      } catch (err) {
        setError(err?.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const course = useMemo(() => {
    return courseRow ? mapCourseRow(courseRow) : null;
  }, [courseRow]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/courses")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>

        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-semibold text-rose-800">Unable to load course</h1>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/courses")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Course not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            The requested course could not be located.
          </p>
        </div>
      </div>
    );
  }

  const hasCurriculum = course.curriculum.length > 0;
  const hasBonusResources =
    course.bonusResources &&
    typeof course.bonusResources === "object" &&
    Object.keys(course.bonusResources).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </button>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses(
                course.status
              )}`}
            >
              {course.status}
            </span>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${visibilityClasses(
                course.visibility
              )}`}
            >
              {course.visibility}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            {course.title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            {course.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            to={`/admin/courses/${course.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <PencilLine className="h-4 w-4" />
            Edit course
          </Link>
		<Link to={`/admin/courses/${courseId}/modules`}>
  <Button variant="secondary" size="sm">
    <BookOpen size={14} /> Module Builder
  </Button>
</Link>
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
            Preview page
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Modules</p>
              <p className="text-2xl font-semibold text-slate-900">{course.modules}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Lessons</p>
              <p className="text-2xl font-semibold text-slate-900">{course.lessons}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Duration</p>
              <p className="text-2xl font-semibold text-slate-900">{course.duration}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Price</p>
              <p className="text-2xl font-semibold text-slate-900">
                {course.price === 0 ? "Free" : `£${course.price}`}
              </p>
            </div>
          </div>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Category
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">{course.category}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Level
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">{course.level}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Instructor
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">{course.instructor}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Last updated
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {formatDate(course.updatedAt)}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Learning outcomes</h2>
            </div>

            <div className="mt-5 space-y-3">
              {course.outcomes.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Curriculum</h2>
            </div>

            <div className="mt-5 space-y-3">
              {hasCurriculum ? (
                course.curriculum.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{module.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {module.items} lesson{module.items === 1 ? "" : "s"}
                      </p>
                    </div>

                    <Link
  to={`/admin/courses/${courseId}/modules/${module.id}/lessons`}
  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
>
  Open
</Link>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No curriculum modules have been added yet.
                </div>
              )}
            </div>
          </article>
        </section>

        <aside className="space-y-6">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Publishing</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">Live data connected</p>
                <p className="mt-1 text-sm text-emerald-700">
                  This course is loading from Supabase successfully.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-2xl bg-slate-300 px-4 py-3 text-sm font-medium text-white"
              >
                Publish course
              </button>

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500"
              >
                Save as draft
              </button>
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Checklist</h2>

            <div className="mt-5 space-y-3">
              {[
                !!course.title,
                !!course.description,
                course.modules > 0,
                hasBonusResources,
              ].map((checked, index) => {
                const labels = [
                  "Course title and description reviewed",
                  "Modules and lesson count confirmed",
                  "Curriculum content added",
                  "Bonus resources checked",
                ];

                return (
                  <label
                    key={labels[index]}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">{labels[index]}</span>
                  </label>
                );
              })}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}