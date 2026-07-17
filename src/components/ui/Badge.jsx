import clsx from "clsx";

export default function Badge({ children, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    accent: "bg-accent-500/10 text-accent-600",
    success: "bg-green-100 text-green-700",
  };
  return (
    <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full", tones[tone])}>
      {children}
    </span>
  );
}
