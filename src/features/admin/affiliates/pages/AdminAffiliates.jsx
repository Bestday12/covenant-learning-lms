// src/features/admin/affiliates/pages/AdminAffiliates.jsx
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, Users, DollarSign, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";

export default function AdminAffiliates() {
  const { showToast } = useToast();
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [commissions, setCommissions] = useState([]);

  const loadAffiliates = async () => {
    try {
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });
      setAffiliates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAffiliates(); }, []);

  const loadCommissions = async (affiliateId) => {
    const { data } = await supabase
      .from("affiliate_commissions")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false });
    setCommissions(data || []);
  };

  const handleApprove = async (affiliate) => {
    const { error } = await supabase
      .from("affiliates")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", affiliate.id);
    if (error) { showToast("Failed to approve", "error"); return; }
    showToast(`${affiliate.full_name} approved! ✅`, "success");
    loadAffiliates();
  };

  const handleSuspend = async (affiliate) => {
    if (!window.confirm(`Suspend ${affiliate.full_name}?`)) return;
    const { error } = await supabase
      .from("affiliates")
      .update({ status: "suspended", updated_at: new Date().toISOString() })
      .eq("id", affiliate.id);
    if (error) { showToast("Failed to suspend", "error"); return; }
    showToast(`${affiliate.full_name} suspended`, "success");
    loadAffiliates();
  };

  const handleMarkPaid = async (commission) => {
    const { error } = await supabase
      .from("affiliate_commissions")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", commission.id);
    if (error) { showToast("Failed to mark paid", "error"); return; }
    // Update affiliate total_paid
    const aff = affiliates.find((a) => a.id === commission.affiliate_id);
    if (aff) {
      await supabase.from("affiliates").update({
        total_paid: (aff.total_paid || 0) + commission.commission_amount,
      }).eq("id", aff.id);
    }
    showToast("Marked as paid ✅", "success");
    loadCommissions(commission.affiliate_id);
    loadAffiliates();
  };

  const filtered = affiliates.filter((a) => filter === "all" || a.status === filter);
  const totalPending = affiliates.reduce((s, a) => s + (a.total_earnings - a.total_paid), 0);
  const totalPaid = affiliates.reduce((s, a) => s + (a.total_paid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Affiliate Programme</h1>
        <p className="text-sm text-slate-500 mt-1">Manage affiliate applications, commissions and payouts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Affiliates", value: affiliates.length, icon: Users },
          { label: "Approved", value: affiliates.filter((a) => a.status === "approved").length, icon: CheckCircle2 },
          { label: "Pending Payout", value: `£${totalPending.toFixed(2)}`, icon: DollarSign },
          { label: "Total Paid", value: `£${totalPaid.toFixed(2)}`, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <s.icon size={20} className="text-slate-400 mb-3" />
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Affiliates list */}
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Filter tabs */}
          <div className="flex border-b border-slate-100 px-6 pt-4 gap-4">
            {["all", "pending", "approved", "suspended"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  filter === f ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {f} {f === "all" ? `(${affiliates.length})` : `(${affiliates.filter((a) => a.status === f).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No affiliates found</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((affiliate) => (
                <div key={affiliate.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${selected?.id === affiliate.id ? "bg-indigo-50" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d0a6e] to-[#5a1a9a] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {affiliate.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{affiliate.full_name}</p>
                    <p className="text-xs text-slate-400">{affiliate.organisation || affiliate.email}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">/{affiliate.referral_code}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-600">£{(affiliate.total_earnings || 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">earned</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      affiliate.status === "approved" ? "bg-green-100 text-green-700" :
                      affiliate.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-rose-100 text-rose-700"
                    }`}>
                      {affiliate.status}
                    </span>
                    {affiliate.status === "pending" && (
                      <button onClick={() => handleApprove(affiliate)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    {affiliate.status === "approved" && (
                      <button onClick={() => handleSuspend(affiliate)} className="p-1.5 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100">
                        <XCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => { setSelected(affiliate); loadCommissions(affiliate.id); }}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5 sticky top-6 max-h-[80vh] overflow-y-auto">
            <div>
              <h3 className="font-semibold text-slate-900">{selected.full_name}</h3>
              <p className="text-sm text-slate-500">{selected.email}</p>
              {selected.organisation && <p className="text-sm text-slate-500">{selected.organisation}</p>}
              <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded mt-2 inline-block">{selected.referral_code}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold text-slate-800">£{(selected.total_earnings || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500">Total Earned</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">£{((selected.total_earnings || 0) - (selected.total_paid || 0)).toFixed(2)}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Commission History</p>
              {commissions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No commissions yet</p>
              ) : (
                <div className="space-y-2">
                  {commissions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                      <div>
                        <p className="text-xs font-medium text-slate-700 truncate max-w-[140px]">{c.course_title || c.course_id}</p>
                        <p className="text-xs text-slate-400">Sale: £{c.sale_amount.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">£{c.commission_amount.toFixed(2)}</p>
                        {c.status !== "paid" ? (
                          <button
                            onClick={() => handleMarkPaid(c)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Mark paid
                          </button>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">Paid ✅</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border-2 border-dashed border-slate-200 p-10 text-center text-slate-400">
            <Eye size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select an affiliate to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
