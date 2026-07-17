import {
  Users,
} from "lucide-react";

export default function EmptyPartners() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white py-20 text-center">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">

        <Users className="h-10 w-10 text-slate-400" />

      </div>

      <h2 className="mt-6 text-xl font-semibold text-slate-900">
        No partner relationships found
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">
        Once learners begin inviting and connecting with
        their spouses, their relationships will appear
        here for administration and support.
      </p>
    </div>
  );
}