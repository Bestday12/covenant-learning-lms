import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminTopbar() {
  const { user } = useAdminAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <h2 className="text-lg font-semibold text-slate-900">Admin Dashboard</h2>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {user?.email?.slice(0, 1)?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.email || "Admin user"}</p>
            <p className="text-xs text-slate-500">Secure console</p>
          </div>
        </div>
      </div>
    </header>
  );
}
