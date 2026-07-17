// src/features/admin/courses/pages/AdminCourses.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock3,
  Eye,
  Filter,
  FilterX,
  Layers3,
  Plus,
  Search,
  SquarePen,
  Tag,
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

function getModuleCount(modules) {
  return Array.isArray(modules) ? modules.length : 0;
}

function getLessonCount(modules) {
  if (!Array.isArray(modules)) return 0;
  // Each module has 5 lesson tabs: Teaching, Reflection, Discussion, Exercise, Worksheets
  return modules.length * 5;
}

function mapCourseRow(row) {
  const modules = Array.isArray(row.modules) ? row.modules : [];

  return {
    id: row.id,
    title: row.title || "Untitled course",
    description: row.description || "",
    category: "General",
    status: "published",
    visibility: "public",
    price: 0,
    modules,
    moduleCount: getModuleCount(modules),
    lessonCount: getLessonCount(modules),
    duration: modules.length > 0 ? `${modules.length} module${modules.length > 1 ? "s" : ""}` : "—",
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
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

function formatPrice(price) {
  return price === 0 ? "Free" : `£${price}`;
}

function EmptyPanel({ icon, title, description, action }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        {icon}
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export default function AdminCourses() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("courses")
          .select("id, title, description, modules, bonus_resources, created_at, updated_at")
          .order("updated_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map courses with lesson counts from modules JSON
          const mappedCourses = data.map((row) => mapCourseRow(row));
          setCourses(mappedCourses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        setError(err?.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((course) => course.status === "published").length;
  const draftCourses = courses.filter((course) => course.status === "draft").length;
  const freeCourses = courses.filter((course) => course.price === 0).length;

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    visibilityFilter !== "all";

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ? true : course.status === statusFilter;

      const matchesVisibility =
        visibilityFilter === "all"
          ? true
          : course.visibility === visibilityFilter;

      return matchesSearch && matchesStatus && matchesVisibility;
    });
  }, [courses, search, statusFilter, visibilityFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setVisibilityFilter("all");
  }

  const showFirstRunEmpty = !loading && !error && totalCourses === 0;
  const showFilteredEmpty = !loading && !error && totalCourses > 0 && filteredCourses.length === 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Courses
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Course management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Create, review, update, and publish learning experiences from one admin workspace.
          </p>
        </div>

        <Link
          to="/admin/courses/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create course
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total courses</p>
              <p className="text-2xl font-semibold text-slate-900">{totalCourses}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Published</p>
              <p className="text-2xl font-semibold text-slate-900">{publishedCourses}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <SquarePen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Drafts</p>
              <p className="text-2xl font-semibold text-slate-900">{draftCourses}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Free courses</p>
              <p className="text-2xl font-semibold text-slate-900">{freeCourses}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row">
            <label className="relative block flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or description"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
              <Eye className="h-4 w-4 text-slate-400" />
              <select
                value={visibilityFilter}
                onChange={(event) => setVisibilityFilter(event.target.value)}
                className="h-11 bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="all">All visibility</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">{filteredCourses.length}</span>{" "}
              course{filteredCourses.length === 1 ? "" : "s"}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <FilterX className="h-4 w-4" />
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : showFirstRunEmpty ? (
            <EmptyPanel
              icon={<BookOpen className="h-6 w-6" />}
              title="No courses yet"
              description="Create your first course to start building learner experiences for preparation, restoration, and guided growth."
              action={
                <Link
                  to="/admin/courses/new"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Create first course
                </Link>
              }
            />
          ) : showFilteredEmpty ? (
            <EmptyPanel
              icon={<Search className="h-6 w-6" />}
              title="No courses match your filters"
              description="Try a different search term or clear filters to see the full course list again."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FilterX className="h-4 w-4" />
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Course
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Content
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Access
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Updated
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-t border-slate-100">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                            <p className="mt-1 line-clamp-2 max-w-xl text-xs text-slate-500">
                              {course.description || "No description yet."}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(
                                course.status
                              )}`}
                            >
                              {course.status}
                            </span>

                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${visibilityClasses(
                                course.visibility
                              )}`}
                            >
                              {course.visibility}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Layers3 className="h-3.5 w-3.5" />
                              {course.moduleCount} modules
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <BookOpen className="h-3.5 w-3.5" />
                              {course.lessonCount} lessons
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="h-3.5 w-3.5" />
                              {course.duration}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm text-slate-600">
                            <p className="font-medium text-slate-900">
                              {formatPrice(course.price)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Learner pricing</p>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-500">
                          {formatDate(course.updatedAt)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/courses/${course.id}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              Open
                            </Link>

                            <Link
                              to={`/admin/courses/${course.id}/edit`}
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                              <SquarePen className="h-4 w-4" />
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredCourses.map((course) => (
                  <article
                    key={course.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">{course.title}</h2>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {course.description || "No description yet."}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(
                            course.status
                          )}`}
                        >
                          {course.status}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${visibilityClasses(
                            course.visibility
                          )}`}
                        >
                          {course.visibility}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Modules
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {course.moduleCount}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Lessons
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {course.lessonCount}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Duration
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {course.duration}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Price
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {formatPrice(course.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                      Updated {formatDate(course.updatedAt)}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/admin/courses/${course.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        Open
                      </Link>

                      <Link
                        to={`/admin/courses/${course.id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        <SquarePen className="h-4 w-4" />
                        Edit
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}