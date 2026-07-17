export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-6 animate-pulse">
      <div className="h-4 w-3/5 bg-brand-100 rounded mb-2" />
      <div className="h-3 w-2/5 bg-brand-100 rounded mb-6" />
      <div className="h-2 w-full bg-brand-100 rounded mb-1" />
      <div className="h-2 w-1/4 bg-brand-100 rounded mb-6" />
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-brand-100 rounded-full" />
        <div className="h-8 w-24 bg-brand-100 rounded-full" />
      </div>
    </div>
  );
}
