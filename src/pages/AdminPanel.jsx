import { useQuery } from "@tanstack/react-query";
import { fetchAllCourses } from "@/services/courseService.js";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import LoadingScreen from "@/components/ui/LoadingScreen.jsx";

export default function AdminPanel() {
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchAllCourses,
  });

  if (isLoading) return <LoadingScreen />;

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-3xl font-bold text-brand-800">Admin Panel</h1>
        <Card>
          <CardHeader title="Course data unavailable" subtitle="We could not load admin course data." />
          <div className="px-6 pb-6">
            <p className="text-sm text-red-700 mb-4">
              {error?.message || "Something went wrong while loading courses."}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Try again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Administration
          </p>
          <h1 className="font-serif text-3xl font-bold text-brand-800">
            Admin Panel
          </h1>
          <p className="mt-2 text-sm text-brand-600">
            Manage courses and monitor system status.
          </p>
        </div>

        <div className="rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-medium text-brand-600">
          {isFetching ? "Refreshing data..." : "Data up to date"}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader title="Total Courses" subtitle="Published and draft records" />
          <div className="px-6 pb-6">
            <p className="font-serif text-4xl text-brand-800">{courses.length}</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Backend Status" />
          <div className="px-6 pb-6">
            <p className="text-sm text-brand-700">
              {import.meta.env.VITE_SUPABASE_URL ? "Supabase connected" : "Offline / demo mode"}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Environment" />
          <div className="px-6 pb-6">
            <p className="text-sm text-brand-700">
              {import.meta.env.VITE_APP_ENV || "development"}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Courses"
          subtitle={courses.length ? `${courses.length} total courses` : "No courses found yet"}
        />
        <div className="px-6 pb-6">
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-6 py-10 text-center">
              <p className="text-sm font-medium text-brand-700">No courses available yet.</p>
              <p className="mt-2 text-sm text-brand-500">
                When courses are added, they will appear here for review.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-brand-100 text-sm text-brand-700">
              {courses.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-brand-800">{c.title}</span>
                  <span className="text-brand-400">{c.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}