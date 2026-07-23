// src/features/admin/dashboard/pages/AdminDashboard.jsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import {
  fetchDashboardMetrics,
  fetchEnrollmentsByCourse,
  fetchRecentEnrollments,
} from "../api/dashboardApi.js";
import {
  Users, BookOpen, TrendingUp, Award,
  ArrowUpRight, PoundSterling, GraduationCap,
  Calendar, Mail,
} from "lucide-react";

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color = "indigo", onClick }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div
      onClick={onClick}
      className={`rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {onClick && <ArrowUpRight size={16} className="text-slate-300" />}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Course revenue row ────────────────────────────────────────────────────────
function CourseRevenueRow({ course, maxEnrollments }) {
  const pct = maxEnrollments > 0 ? Math.round((course.enrollments / maxEnrollments) * 100) : 0;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{course.title}</p>
        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-900">{course.enrollments} enrolled</p>
        <p className="text-xs text-emerald-600 font-medium">£{course.revenue.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ── Recent enrollment row ─────────────────────────────────────────────────────
function EnrollmentRow({ enrollment }) {
  const name = enrollment.profiles?.full_name || enrollment.profiles?.email || "Unknown";
  const email = enrollment.profiles?.email || "";
  const course = enrollment.courses?.title || enrollment.course_id;
  const date = new Date(enrollment.enrolled_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
        <p className="text-xs text-slate-400 truncate">{course}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-slate-500">{date}</p>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: fetchDashboardMetrics,
    staleTime: 60_000,
  });

  const { data: courseRevenue = [], isLoading: courseLoading } = useQuery({
    queryKey: ["admin-course-revenue"],
    queryFn: fetchEnrollmentsByCourse,
    staleTime: 60_000,
  });

  const { data: recentEnrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["admin-recent-enrollments"],
    queryFn: () => fetchRecentEnrollments(8),
    staleTime: 60_000,
  });

  const maxEnrollments = Math.max(...courseRevenue.map((c) => c.enrollments), 1);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">WORKSPACE</p>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Covenant Learning · Revenue & Enrollment Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 leading-none">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={PoundSterling}
          label="Total Revenue"
          value={metricsLoading ? "—" : `£${(metrics?.totalRevenue || 0).toLocaleString()}`}
          sub="From all enrollments"
          color="green"
        />
        <MetricCard
          icon={Users}
          label="Total Students"
          value={metricsLoading ? "—" : metrics?.totalUsers || 0}
          sub="Registered accounts"
          color="indigo"
          onClick={() => navigate("/admin/users")}
        />
        <MetricCard
          icon={GraduationCap}
          label="Enrollments"
          value={metricsLoading ? "—" : metrics?.totalEnrollments || 0}
          sub="Across all courses"
          color="purple"
        />
        <MetricCard
          icon={BookOpen}
          label="Courses"
          value={metricsLoading ? "—" : metrics?.totalCourses || 0}
          sub="Published courses"
          color="blue"
          onClick={() => navigate("/admin/courses")}
        />
        <MetricCard
          icon={Award}
          label="Certificates"
          value={metricsLoading ? "—" : metrics?.totalCertificates || 0}
          sub="Courses completed"
          color="amber"
        />
        <MetricCard
          icon={TrendingUp}
          label="Completion Rate"
          value={metricsLoading ? "—" : `${metrics?.completionRate || 0}%`}
          sub="Enrolled → completed"
          color="rose"
        />
      </div>

      {/* Revenue by course + Recent enrollments */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Revenue by course */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Revenue by Course</h2>
              <p className="text-sm text-slate-400 mt-0.5">Enrollments and income per course</p>
            </div>
            <button
              onClick={() => navigate("/admin/courses")}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>

          {courseLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : courseRevenue.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No enrollments yet</p>
          ) : (
            <div>
              {courseRevenue.map((course) => (
                <CourseRevenueRow
                  key={course.courseId}
                  course={course}
                  maxEnrollments={maxEnrollments}
                />
              ))}
            </div>
          )}

          {/* Total row */}
          {courseRevenue.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-lg font-bold text-emerald-600">
                £{courseRevenue.reduce((s, c) => s + c.revenue, 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Recent enrollments */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Enrollments</h2>
              <p className="text-sm text-slate-400 mt-0.5">Latest students who enrolled</p>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>

          {enrollmentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentEnrollments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No enrollments yet</p>
          ) : (
            recentEnrollments.map((e) => (
              <EnrollmentRow key={e.id} enrollment={e} />
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-1">Quick Actions</h2>
        <p className="text-sm text-slate-400 mb-5">Common admin tasks</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/admin/courses/new")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            <BookOpen size={15} /> Create New Course
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            <Users size={15} /> Manage Students
          </button>
          <button
            onClick={() => navigate("/admin/courses")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            <GraduationCap size={15} /> View All Courses
          </button>
        </div>
      </div>

    </div>
  );
}
