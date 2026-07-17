export default function LoadingScreen() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-brand-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
