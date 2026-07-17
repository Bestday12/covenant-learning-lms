import {
  Eye,
  Copy,
  Unlink,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import { initials, getRelationshipStatus } from "../lib/partnerHelpers";

export default function PartnerTable({
  partners,
  onView,
  onCopy,
  onUnlink,
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-4 text-left text-xs uppercase text-slate-400">
              User
            </th>
            <th className="px-5 py-4 text-left text-xs uppercase text-slate-400">
              Partner
            </th>
            <th className="px-5 py-4 text-left text-xs uppercase text-slate-400">
              Status
            </th>
            <th className="px-5 py-4 text-left text-xs uppercase text-slate-400">
              Invite
            </th>
            <th className="px-5 py-4 text-left text-xs uppercase text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => {
            // Calculate status dynamically
            const status = getRelationshipStatus(partner);
            
            return (
              <tr
                key={partner.id}
                className="border-t border-slate-100"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-medium">
                      {initials(partner.full_name)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {partner.full_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {partner.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p>
                      {partner.partner_name || "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {partner.partner_email || ""}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={status} />
                </td>

                <td className="px-5 py-4 font-mono">
                  {partner.invite_code || "—"}
                </td>

                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(partner)}
                      className="rounded-lg p-2 hover:bg-slate-100"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onCopy(partner)}
                      className="rounded-lg p-2 hover:bg-slate-100"
                      title="Copy invite code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {partner.partner_id && (
                      <button
                        onClick={() => onUnlink(partner)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Remove relationship"
                      >
                        <Unlink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}