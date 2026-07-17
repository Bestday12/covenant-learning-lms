import { Link2, Mail, User2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { initials } from "../lib/partnerHelpers";

export default function PartnerRelationshipCard({
  partner,
  onView,
}) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">

      <div className="flex justify-between">

        <div className="flex gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
            {initials(partner.full_name)}
          </div>

          <div>

            <h3 className="text-lg font-semibold text-slate-900">
              {partner.full_name || "Unnamed User"}
            </h3>

            <p className="text-sm text-slate-500">
              {partner.email}
            </p>

            <div className="mt-3">
              <StatusBadge status={partner.status} />
            </div>

          </div>

        </div>

        <button
          onClick={() => onView(partner)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          View
        </button>

      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <div className="flex gap-2">

          <Link2 className="h-5 w-5 text-emerald-600"/>

          <div>

            <p className="text-xs text-slate-400">
              Partner
            </p>

            <p className="font-medium text-slate-800">
              {partner.partner_name || "Not Linked"}
            </p>

          </div>

        </div>

        <div className="flex gap-2">

          <Mail className="h-5 w-5 text-blue-600"/>

          <div>

            <p className="text-xs text-slate-400">
              Partner Email
            </p>

            <p className="text-sm">
              {partner.partner_email || "—"}
            </p>

          </div>

        </div>

        <div className="flex gap-2">

          <User2 className="h-5 w-5 text-violet-600"/>

          <div>

            <p className="text-xs text-slate-400">
              Invite Code
            </p>

            <p className="font-mono">
              {partner.invite_code || "—"}
            </p>

          </div>

        </div>

      </div>

    </article>
  );
}