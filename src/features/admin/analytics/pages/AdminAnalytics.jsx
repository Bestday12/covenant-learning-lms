// src/features/admin/analytics/pages/AdminAnalytics.jsx
import { useState, useEffect } from "react";
import { TrendingUp, Users, Award, BookOpen, Loader2, BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase.js";

// ── Simple bar chart ──────────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = "#3d0a6e", prefix = "" }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-slate-600 truncate max-w-[200px]">{item[labelKey]}</p>
            <p className="text-xs font-bold text-slate-800 ml-2 flex-shrink-0">
              {prefix}{typeof item[valueKey] === "number" ? item[valueKey].toLocaleString() : item[valueKey]}
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${(item[valueKey] / max) * 100}%`,
                background: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Revenue line chart (SVG) ──────────────────────────────────────────────────
function RevenueChart({ data }) {
  if (!data?.length) return <p className="text-sm text-slate-400 text-center py-8">No revenue data yet</p>;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - (d.revenue / maxRevenue) * chartH,
    revenue: d.revenue,
    month: d.month,
    enrollments: d.enrollments,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 300 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <g key={pct}>
            <line
              x1={padding.left} y1={padding.top + chartH * (1 - pct)}
              x2={padding.left + chartW} y2={padding.top + chartH * (1 - pct)}
              stroke="#f1f5f9" strokeWidth="1"
            />
            <text x={padding.left - 8} y={padding.top + chartH * (1 - pct) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              £{Math.round(maxRevenue * pct).toLocaleString()}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="#3d0a6e" fillOpacity="0.08" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#3d0a6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#3d0a6e" stroke="white" strokeWidth="2" />
            <text x={p.x} y={padding.top + chartH + 20} textAnchor="middle" fontSize="10" fill="#64748b">
              {p.month}
            </text>
            {/* Tooltip on hover area */}
            <title>£{p.revenue.toLocaleString()} · {p.enrollments} enrollments</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Completion rate donut ─────────────────────────────────────────────────────
function DonutChart({ percentage, size = 80 }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  const color = percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#3d0a6e";

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
      <circle
        cx="40" cy="40" r={radius}
        fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">
        {percentage}%
      </text>
    </svg>
  );
}

// ── Main analytics page ───────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalEnrollments: 0,
    avgCompletion: 0,
    totalCertificates: 0,
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        // Revenue by month
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("enrolled_at, course_id, courses(price)");

        // Group by month
        const monthMap: Record<string, { revenue: number; enrollments: number }> = {};
        for (const e of enrollments || []) {
          const date = new Date(e.enrolled_at);
          const key = date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
          if (!monthMap[key]) monthMap[key] = { revenue: 0, enrollments: 0 };
          monthMap[key].revenue += (e.courses as any)?.price || 0;
          monthMap[key].enrollments += 1;
        }
        const monthData = Object.entries(monthMap).map(([month, data]) => ({ month, ...data }));
        setRevenueData(monthData);

        // Total revenue and enrollments
        const totalRevenue = (enrollments || []).reduce((s, e) => s + ((e.courses as any)?.price || 0), 0);
        const totalEnrollments = (enrollments || []).length;

        // Completion rates by course
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title");

        const { data: certs } = await supabase
          .from("certificates")
          .select("user_id, course_id");

        const certMap: Record<string, Set<string>> = {};
        for (const c of certs || []) {
          if (!certMap[c.course_id]) certMap[c.course_id] = new Set();
          certMap[c.course_id].add(c.user_id);
        }

        const enrollMap: Record<string, Set<string>> = {};
        for (const e of enrollments || []) {
          if (!enrollMap[e.course_id]) enrollMap[e.course_id] = new Set();
          enrollMap[e.course_id].add((e as any).user_id || "");
        }

        const completionStats = (courses || []).map((course) => {
          const enrolled = enrollMap[course.id]?.size || 0;
          const completed = certMap[course.id]?.size || 0;
          const rate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
          return { title: course.title, enrolled, completed, rate };
        }).filter((c) => c.enrolled > 0).sort((a, b) => b.enrolled - a.enrolled);

        setCompletionData(completionStats);

        // Top courses by revenue
        const courseRevMap: Record<string, { title: string; revenue: number; enrollments: number }> = {};
        for (const e of enrollments || []) {
          const id = e.course_id;
          const price = (e.courses as any)?.price || 0;
          const course = (courses || []).find((c) => c.id === id);
          if (!courseRevMap[id]) courseRevMap[id] = { title: course?.title || id, revenue: 0, enrollments: 0 };
          courseRevMap[id].revenue += price;
          courseRevMap[id].enrollments += 1;
        }
        const topCoursesData = Object.values(courseRevMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
        setTopCourses(topCoursesData);

        // Total certificates
        const totalCertificates = (certs || []).length;
        const avgCompletion = completionStats.length > 0
          ? Math.round(completionStats.reduce((s, c) => s + c.rate, 0) / completionStats.length)
          : 0;

        setSummary({ totalRevenue, totalEnrollments, avgCompletion, totalCertificates });
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin text-slate-400" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Revenue, enrollment and completion insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `£${summary.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Enrollments", value: summary.totalEnrollments, icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Certificates Issued", value: summary.totalCertificates, icon: Award, color: "text-amber-600 bg-amber-50" },
          { label: "Avg Completion Rate", value: `${summary.avgCompletion}%`, icon: BarChart2, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Revenue Over Time</h2>
        <p className="text-sm text-slate-400 mb-6">Monthly enrollment revenue</p>
        <RevenueChart data={revenueData} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        {/* Revenue by course */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Revenue by Course</h2>
          <p className="text-sm text-slate-400 mb-6">Top performing courses</p>
          {topCourses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
          ) : (
            <BarChart data={topCourses} valueKey="revenue" labelKey="title" color="#3d0a6e" prefix="£" />
          )}
        </div>

        {/* Completion rates */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Completion Rates</h2>
          <p className="text-sm text-slate-400 mb-6">Students who earned certificates</p>
          {completionData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {completionData.map((course, i) => (
                <div key={i} className="flex items-center gap-4">
                  <DonutChart percentage={course.rate} size={64} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{course.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {course.completed} of {course.enrolled} completed
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${course.rate}%`,
                          background: course.rate >= 70 ? "#10b981" : course.rate >= 40 ? "#f59e0b" : "#3d0a6e",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Enrollments by course table */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Course Performance Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Course</th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Enrolled</th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Completed</th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Rate</th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {completionData.map((course, i) => {
                const rev = topCourses.find((c) => c.title === course.title)?.revenue || 0;
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-700 max-w-[200px] truncate">{course.title}</td>
                    <td className="py-3 text-right text-slate-600">{course.enrolled}</td>
                    <td className="py-3 text-right text-slate-600">{course.completed}</td>
                    <td className="py-3 text-right">
                      <span className={`font-bold ${course.rate >= 70 ? "text-emerald-600" : course.rate >= 40 ? "text-amber-600" : "text-slate-600"}`}>
                        {course.rate}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600">£{rev.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="py-3 font-bold text-slate-800">Total</td>
                <td className="py-3 text-right font-bold text-slate-800">{summary.totalEnrollments}</td>
                <td className="py-3 text-right font-bold text-slate-800">{summary.totalCertificates}</td>
                <td className="py-3 text-right font-bold text-slate-800">{summary.avgCompletion}%</td>
                <td className="py-3 text-right font-bold text-emerald-600">£{summary.totalRevenue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
