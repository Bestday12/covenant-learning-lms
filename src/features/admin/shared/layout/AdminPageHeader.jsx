export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>

        {description ? (
          <p className="max-w-2xl text-sm text-slate-500">{description}</p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}