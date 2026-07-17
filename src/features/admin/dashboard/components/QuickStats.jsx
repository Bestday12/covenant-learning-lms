import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";

const stats = [
  {
    title: "Review newly registered users",
    detail: "Approve access, verify roles, and catch suspicious sign-ups early.",
    priority: "High",
    icon: AlertCircle,
    tone: "rose",
    actionLabel: "Open users",
  },
  {
    title: "Check unpublished or incomplete courses",
    detail: "Make sure draft lessons, missing modules, and hidden assets are resolved.",
    priority: "Medium",
    icon: Clock3,
    tone: "amber",
    actionLabel: "Open courses",
  },
  {
    title: "Inspect broken partner links",
    detail: "Confirm active referrals, destination pages, and tracking integrity.",
    priority: "Low",
    icon: CheckCircle2,
    tone: "emerald",
    actionLabel: "Open partners",
  },
];

const toneMap = {
  rose: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    iconWrap: "bg-rose-500/10 text-rose-600",
    card: "border-rose-100 hover:border-rose-200 hover:bg-rose-50/40",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    iconWrap: "bg-amber-500/10 text-amber-600",
    card: "border-amber-100 hover:border-amber-200 hover:bg-amber-50/40",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconWrap: "bg-emerald-500/10 text-emerald-600",
    card: "border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/40",
  },
};

export default function QuickStats() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Focus
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
            Priority checks
          </h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Keep admin work focused with a ranked list of operational checks that need attention.
          </p>
        </div>

        <div className="hidden rounded-2xl bg-slate-100 px-3 py-2 text-right sm:block">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Active
          </p>
          <p className="text-base font-semibold text-slate-900">{stats.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {stats.map(({ title, detail, priority, icon: Icon, tone, actionLabel }) => {
          const styles = toneMap[tone];

          return (
            <article
              key={title}
              className={`group rounded-2xl border bg-white p-4 transition-all duration-200 ${styles.card}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}
                    >
                      {priority}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>

                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:text-slate-900"
                  >
                    {actionLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}