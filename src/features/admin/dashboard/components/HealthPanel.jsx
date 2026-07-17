import { CheckCircle2, Database, ShieldCheck, Siren, Wifi } from "lucide-react";

const checks = [
  {
    label: "Authentication",
    value: "Connected",
    detail: "Admin sessions and role checks are responding normally.",
    status: "healthy",
    icon: ShieldCheck,
  },
  {
    label: "Database",
    value: "Available",
    detail: "Core reads and writes are reachable for dashboard metrics.",
    status: "healthy",
    icon: Database,
  },
  {
    label: "Admin APIs",
    value: "Ready",
    detail: "Operational services are available for admin workflows.",
    status: "healthy",
    icon: Wifi,
  },
];

const statusMap = {
  healthy: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    iconWrap: "bg-emerald-500/10 text-emerald-600",
    dot: "bg-emerald-500",
    summary: "All systems normal",
    summaryIcon: CheckCircle2,
  },
  warning: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    iconWrap: "bg-amber-500/10 text-amber-600",
    dot: "bg-amber-500",
    summary: "Attention needed",
    summaryIcon: Siren,
  },
  critical: {
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    iconWrap: "bg-rose-500/10 text-rose-600",
    dot: "bg-rose-500",
    summary: "Degraded state",
    summaryIcon: Siren,
  },
};

export default function HealthPanel() {
  const overallStatus = checks.some((item) => item.status === "critical")
    ? "critical"
    : checks.some((item) => item.status === "warning")
      ? "warning"
      : "healthy";

  const overall = statusMap[overallStatus];
  const SummaryIcon = overall.summaryIcon;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Reliability
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
            System health
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            High-level operational checks for the admin workspace and supporting services.
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${overall.badge}`}>
          <SummaryIcon className="h-4 w-4" />
          {overall.summary}
        </div>
      </div>

      <div className="space-y-3">
        {checks.map(({ label, value, detail, status, icon: Icon }) => {
          const styles = statusMap[status];

          return (
            <article
              key={label}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                    <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{detail}</p>
                </div>
              </div>

              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}>
                {value}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}