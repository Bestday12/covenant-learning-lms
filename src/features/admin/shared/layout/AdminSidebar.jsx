import { NavLink } from "react-router-dom";
import { adminNavigation } from "../constants/admin.navigation";

export default function AdminSidebar() {
  return (
    <aside className="border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Control Center</h1>
      </div>

      <nav className="space-y-2">
        {adminNavigation.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
