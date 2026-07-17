// src/features/admin/partners/components/StatusBadge.jsx
import {
  CheckCircle2,
  Clock3,
  UserRoundX,
} from "lucide-react";

export default function StatusBadge({ status }) {
  // Normalize status to lowercase for comparison
  const normalizedStatus = status?.toLowerCase() || "unlinked";
  
  if (normalizedStatus === "linked") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Linked
      </span>
    );
  }

  if (normalizedStatus === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
        <Clock3 className="h-3.5 w-3.5" />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <UserRoundX className="h-3.5 w-3.5" />
      Unlinked
    </span>
  );
}