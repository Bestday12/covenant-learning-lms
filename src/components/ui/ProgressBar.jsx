export default function ProgressBar({ value = 0, label }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-brand-500 mb-1">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className="h-2 rounded-full bg-brand-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-accent-500 transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
