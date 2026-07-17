import {
  Search,
  RefreshCw,
} from "lucide-react";

export default function PartnerFilters({
  search,
  setSearch,
  status,
  setStatus,
  onRefresh,
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

      <div className="flex flex-col gap-3 md:flex-row">

        <label className="relative">

          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search name, email or invite code..."
            className="h-11 w-full rounded-2xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-slate-100 md:w-96"
          />
        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="h-11 rounded-2xl border border-slate-200 px-4 text-sm"
        >
          <option value="all">
            All Relationships
          </option>

          <option value="linked">
            Linked
          </option>

          <option value="unlinked">
            Unlinked
          </option>

          <option value="pending">
            Pending Invite
          </option>
        </select>

      </div>

      <button
        onClick={onRefresh}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium hover:bg-slate-50"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button>
    </section>
  );
}