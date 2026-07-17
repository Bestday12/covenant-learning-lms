export default function DataTable({ title = "Table", description = "", children = null }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children || <div className="text-sm text-slate-500">No table content yet.</div>}
    </section>
  );
}
