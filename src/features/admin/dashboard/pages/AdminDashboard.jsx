import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import MetricsGrid from "../components/MetricsGrid";
import QuickStats from "../components/QuickStats";
import RecentActivity from "../components/RecentActivity";
import HealthPanel from "../components/HealthPanel";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-[32px] bg-slate-200/70" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-[28px] bg-slate-200/70" />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="h-[420px] rounded-[28px] bg-slate-200/70" />
          <div className="h-[420px] rounded-[28px] bg-slate-200/70" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[280px] rounded-[28px] bg-slate-200/70" />
          <div className="h-[280px] rounded-[28px] bg-slate-200/70" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
        Failed to load dashboard metrics: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.65)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Secure console
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-300">Overview</p>

              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Admin control center
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Monitor user growth, course readiness, partner activity, and operational
                priorities from one premium workspace built for fast decision-making.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Focus</p>
              <p className="mt-2 text-sm font-medium text-white">
                Review new users and unpublished courses
              </p>
            </div>

            <div className="flex flex-col gap-2">
  <button
    type="button"
    onClick={() => navigate("/admin/users")}
    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
  >
    Open user management
    <ArrowUpRight className="h-4 w-4" />
  </button>
  <button
    type="button"
    onClick={() => navigate("/admin/courses/new")}
    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
  >
    Create new course
    <ArrowUpRight className="h-4 w-4" />
  </button>
</div>
          </div>
        </div>
      </section>

      <MetricsGrid metrics={data} />

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <RecentActivity />
        <QuickStats />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <HealthPanel />

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Workflow
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
              Publishing pipeline
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Surface draft courses, incomplete modules, and content awaiting review.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Draft courses</p>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  Review
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Check unpublished courses before they go live.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Incomplete modules</p>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  Track
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Identify lessons that still need content, media, or assessments.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Pending approvals</p>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Healthy
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Keep publication flow moving with fast editorial decisions.
              </p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}