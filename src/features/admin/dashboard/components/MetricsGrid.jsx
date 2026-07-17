import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Link2,
  Users,
} from "lucide-react";

export default function MetricsGrid({ metrics }) {
  const items = [
    {
      label: "Users",
      value: metrics?.totalUsers ?? 0,
      detail: "Registered accounts with workspace access.",
      status: "Live count",
      statusLabel: "from profiles",
      icon: Users,
      tone: "blue",
    },
    {
      label: "Courses",
      value: metrics?.totalCourses ?? 0,
      detail: "Published and draft learning experiences.",
      status: "Current total",
      statusLabel: "from courses",
      icon: BookOpen,
      tone: "violet",
    },
    {
      label: "Partner Links",
      value: metrics?.linkedPartners ?? 0,
      detail: "Tracked referrals and active partner routes.",
      status: "Tracked",
      statusLabel: "from partner links",
      icon: Link2,
      tone: "emerald",
    },
    {
      label: "Pending Issues",
      value: metrics?.pendingIssues ?? 0,
      detail: "Operational items requiring admin review.",
      status: "Monitoring",
      statusLabel: "manual rule set",
      icon: AlertTriangle,
      tone: "amber",
    },
  ];

  const toneMap = {
    blue: {
      iconWrap: "bg-blue-500/10 text-blue-600",
      chip: "bg-blue-50 text-blue-700 border-blue-100",
      glow: "from-blue-500/10 to-cyan-500/5",
    },
    violet: {
      iconWrap: "bg-violet-500/10 text-violet-600",
      chip: "bg-violet-50 text-violet-700 border-violet-100",
      glow: "from-violet-500/10 to-fuchsia-500/5",
    },
    emerald: {
      iconWrap: "bg-emerald-500/10 text-emerald-600",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
      glow: "from-emerald-500/10 to-teal-500/5",
    },
    amber: {
      iconWrap: "bg-amber-500/10 text-amber-600",
      chip: "bg-amber-50 text-amber-700 border-amber-100",
      glow: "from-amber-500/10 to-orange-500/5",
    },
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, detail, status, statusLabel, icon: Icon, tone }) => {
        const styles = toneMap[tone];

        return (
          <article
            key={label}
            className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_-24px_rgba(15,23,42,0.2)]"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${styles.glow}`}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  {value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <p className="relative mt-3 text-sm leading-6 text-slate-500">{detail}</p>

            <div className="relative mt-5 flex items-center justify-between gap-3">
              <div
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.chip}`}
              >
                {status}
              </div>

              <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                {statusLabel}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}