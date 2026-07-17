import { Activity, BookOpen, Link2, Users } from "lucide-react";

const items = [
  {
    title: "New user registration reviewed",
    detail: "Sam Adeyemi was verified and granted admin workspace access.",
    time: "2 min ago",
    category: "Users",
    icon: Users,
    tone: "blue",
  },
  {
    title: "Course draft updated",
    detail: "Covenant Marriage Foundation content was revised before publishing.",
    time: "18 min ago",
    category: "Courses",
    icon: BookOpen,
    tone: "amber",
  },
  {
    title: "Partner link requires attention",
    detail: "One referral destination returned an incomplete landing experience.",
    time: "42 min ago",
    category: "Partners",
    icon: Link2,
    tone: "rose",
  },
];

const toneMap = {
  blue: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    iconWrap: "bg-blue-500/10 text-blue-600",
    line: "from-blue-200",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    iconWrap: "bg-amber-500/10 text-amber-600",
    line: "from-amber-200",
  },
  rose: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    iconWrap: "bg-rose-500/10 text-rose-600",
    line: "from-rose-200",
  },
};

export default function RecentActivity() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Live feed
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
            Recent activity
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Monitor operational events across users, courses, and partner workflows.
          </p>
        </div>

        <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:block">
          <div className="flex items-center gap-2 text-slate-700">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Audit-ready
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map(({ title, detail, time, category, icon: Icon, tone }, index) => {
          const styles = toneMap[tone];

          return (
            <article key={title} className="relative flex gap-4">
              {index !== items.length - 1 && (
                <div
                  className={`absolute left-[21px] top-12 h-[calc(100%-1rem)] w-px bg-gradient-to-b ${styles.line} to-slate-100`}
                />
              )}

              <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ${styles.dot}`} />
                <Icon className={`h-5 w-5 ${styles.iconWrap}`} />
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}
                  >
                    {category}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{time}</span>
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}