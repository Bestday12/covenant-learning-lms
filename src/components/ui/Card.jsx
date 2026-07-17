import clsx from "clsx";

export function Card({ children, className, ...props }) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div
      className={clsx(
        "mb-5 flex items-start justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        <h3 className="font-serif text-lg font-semibold text-brand-800">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-brand-500">
            {subtitle}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}