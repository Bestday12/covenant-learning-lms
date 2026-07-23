// src/pages/AffiliateDashboard.jsx
// Affiliate dashboard — visible to approved affiliates
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Copy, CheckCircle2, TrendingUp, DollarSign, Users, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";

const LMS_URL = "https://learn.covenantmarriagehelp.com";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [affiliate, setAffiliate] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [clicks, setClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        // Load affiliate record
        const { data: aff } = await supabase
          .from("affiliates")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setAffiliate(aff);

        if (aff) {
          // Load commissions
          const { data: comms } = await supabase
            .from("affiliate_commissions")
            .select("*")
            .eq("affiliate_id", aff.id)
            .order("created_at", { ascending: false });
          setCommissions(comms || []);

          // Load click count
          const { count } = await supabase
            .from("affiliate_clicks")
            .select("id", { count: "exact", head: true })
            .eq("affiliate_id", aff.id);
          setClicks(count || 0);
        }

        // Load courses for referral links
        const { data: courseData } = await supabase
          .from("courses")
          .select("id, title, price");
        setCourses(courseData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const copyLink = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    showToast("Link copied!", "success");
    setTimeout(() => setCopied(""), 2000);
  };

  const pendingEarnings = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((s, c) => s + c.commission_amount, 0);
  const totalEarnings = commissions.reduce((s, c) => s + c.commission_amount, 0);
  const paidEarnings = commissions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.commission_amount, 0);
  const conversions = commissions.length;

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin text-brand-400" size={32} />
    </div>
  );

  // Not an affiliate yet — show application form
  if (!affiliate) return <AffiliateApplyForm userId={user?.id} onApplied={() => window.location.reload()} />;

  // Pending approval
  if (affiliate.status === "pending") return (
    <div className="max-w-2xl mx-auto py-16 text-center px-6">
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">⏳</span>
      </div>
      <h1 className="font-serif text-2xl font-bold text-brand-800 mb-3">Application Under Review</h1>
      <p className="text-brand-500 mb-4">
        Thank you for applying to the Covenant Learning Affiliate Programme. Reverend Sam will review your application and you will receive an email when approved.
      </p>
      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5 text-left">
        <p className="text-sm font-semibold text-brand-700 mb-2">Your Application Details</p>
        <p className="text-sm text-brand-500">Name: {affiliate.full_name}</p>
        <p className="text-sm text-brand-500">Organisation: {affiliate.organisation || "—"}</p>
        <p className="text-sm text-brand-500">Referral Code: <span className="font-mono font-bold">{affiliate.referral_code}</span></p>
      </div>
    </div>
  );

  // Suspended
  if (affiliate.status === "suspended") return (
    <div className="max-w-2xl mx-auto py-16 text-center px-6">
      <h1 className="font-serif text-2xl font-bold text-brand-800 mb-3">Account Suspended</h1>
      <p className="text-brand-500">Please contact support@covenantmarriagehelp.com for assistance.</p>
    </div>
  );

  // Approved affiliate dashboard
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-800 mb-1">Affiliate Dashboard</h1>
        <p className="text-brand-500">Welcome, {affiliate.full_name} · Code: <span className="font-mono font-bold text-brand-700">{affiliate.referral_code}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Earnings", value: `£${totalEarnings.toFixed(2)}`, icon: "💰", color: "bg-green-50 border-green-100" },
          { label: "Pending Payout", value: `£${pendingEarnings.toFixed(2)}`, icon: "⏳", color: "bg-amber-50 border-amber-100" },
          { label: "Total Paid", value: `£${paidEarnings.toFixed(2)}`, icon: "✅", color: "bg-blue-50 border-blue-100" },
          { label: "Conversions", value: conversions, icon: "🎯", color: "bg-purple-50 border-purple-100" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border ${stat.color} p-5 text-center`}>
            <p className="text-3xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-brand-800">{stat.value}</p>
            <p className="text-xs text-brand-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Commission info */}
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-[#3d0a6e] to-[#5a1a9a] p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-2">Your Commission Rate</p>
        <p className="font-serif text-3xl font-bold mb-1">{affiliate.commission_rate}% per sale</p>
        <p className="text-white/70 text-sm">Minimum £{affiliate.minimum_commission} per conversion · Paid monthly via bank transfer</p>
      </div>

      {/* Referral links */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-800 mb-1">Your Referral Links</h2>
        <p className="text-sm text-brand-500 mb-5">Share these links with couples, churches and communities. You earn commission on every purchase.</p>

        {/* General link */}
        <div className="mb-4">
          <p className="text-xs font-bold text-brand-500 uppercase tracking-wide mb-2">General Link</p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600 flex-1 truncate font-mono">
              {LMS_URL}?ref={affiliate.referral_code}
            </span>
            <button
              onClick={() => copyLink(`${LMS_URL}?ref=${affiliate.referral_code}`, "general")}
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand-700 text-white px-3 py-1.5 text-xs font-medium hover:bg-brand-800"
            >
              {copied === "general" ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {copied === "general" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Per course links */}
        <p className="text-xs font-bold text-brand-500 uppercase tracking-wide mb-2">Course-Specific Links</p>
        <div className="space-y-2">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-brand-700 truncate">{course.title}</p>
                <p className="text-xs text-slate-400 font-mono truncate">
                  {LMS_URL}/checkout/{course.id}?ref={affiliate.referral_code}
                </p>
              </div>
              <button
                onClick={() => copyLink(`${LMS_URL}/checkout/${course.id}?ref=${affiliate.referral_code}`, course.id)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand-700 text-white px-3 py-1.5 text-xs font-medium hover:bg-brand-800"
              >
                {copied === course.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied === course.id ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Commission history */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-800 mb-5">Commission History</h2>
        {commissions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-brand-500 font-medium">No commissions yet</p>
            <p className="text-brand-400 text-sm mt-1">Share your referral links to start earning</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Course</th>
                  <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Sale</th>
                  <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Commission</th>
                  <th className="text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="py-3 text-brand-700 font-medium">{c.course_title || c.course_id}</td>
                    <td className="py-3 text-right text-slate-600">£{c.sale_amount.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">£{c.commission_amount.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        c.status === "paid" ? "bg-green-100 text-green-700" :
                        c.status === "approved" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout request */}
      {pendingEarnings >= 20 && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-2xl mb-2">💸</p>
          <h3 className="font-serif text-xl font-bold text-brand-800 mb-2">Ready for Payout</h3>
          <p className="text-brand-500 text-sm mb-4">You have £{pendingEarnings.toFixed(2)} available. Contact us to arrange payment.</p>
          <a
            href={`mailto:support@covenantmarriagehelp.com?subject=Affiliate Payout Request - ${affiliate.referral_code}&body=Hello, I would like to request a payout of £${pendingEarnings.toFixed(2)} for my affiliate commissions. My referral code is ${affiliate.referral_code}.`}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-green-700 transition-colors"
          >
            Request Payout
          </a>
        </div>
      )}

    </div>
  );
}

// ── Apply form ────────────────────────────────────────────────────────────────
function AffiliateApplyForm({ userId, onApplied }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", organisation: "", referral_code: "", why: "" });
  const [saving, setSaving] = useState(false);

  const generateCode = (name) => {
    return name.toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9-]/g, "").slice(0, 15);
  };

  const handleNameChange = (name) => {
    setForm((f) => ({ ...f, full_name: name, referral_code: generateCode(name) }));
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.referral_code) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("affiliates").insert({
        user_id: userId,
        full_name: form.full_name,
        email: form.email,
        organisation: form.organisation,
        referral_code: form.referral_code.toUpperCase(),
        commission_rate: 20,
        minimum_commission: 10,
        status: "pending",
      });
      if (error) throw error;
      showToast("Application submitted! We will review it shortly.", "success");
      onApplied?.();
    } catch (err) {
      if (err.message?.includes("unique")) {
        showToast("That referral code is already taken — try another", "error");
      } else {
        showToast(err.message || "Failed to submit application", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3d0a6e] to-[#c9960c] flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🤝</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-brand-800 mb-3">Join Our Affiliate Programme</h1>
        <p className="text-brand-500 text-lg">Earn commission by referring couples to Covenant Learning courses. Every referral is kingdom multiplication.</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: "💰", title: "20% Commission", desc: "On every sale you refer" },
          { icon: "🔗", title: "Unique Links", desc: "Track every referral" },
          { icon: "📊", title: "Live Dashboard", desc: "See clicks & earnings" },
        ].map((b) => (
          <div key={b.title} className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-center">
            <p className="text-2xl mb-2">{b.icon}</p>
            <p className="text-sm font-bold text-brand-800">{b.title}</p>
            <p className="text-xs text-brand-500 mt-1">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-brand-800">Apply Now</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Pastor John Smith"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="pastor@church.org"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Church / Organisation</label>
          <input
            type="text"
            value={form.organisation}
            onChange={(e) => setForm((f) => ({ ...f, organisation: e.target.value }))}
            placeholder="Grace Community Church"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Your Referral Code <span className="text-red-500">*</span>
            <span className="text-slate-400 font-normal ml-1">(auto-generated, you can edit)</span>
          </label>
          <input
            type="text"
            value={form.referral_code}
            onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") }))}
            placeholder="PASTOR-JOHN"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono uppercase focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
          />
          {form.referral_code && (
            <p className="text-xs text-slate-400 mt-1">
              Your link: learn.covenantmarriagehelp.com?ref={form.referral_code}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">How will you promote Covenant Learning?</label>
          <textarea
            value={form.why}
            onChange={(e) => setForm((f) => ({ ...f, why: e.target.value }))}
            placeholder="I lead a marriage ministry at my church and will recommend these courses to couples..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#3d0a6e] text-white px-6 py-3 text-sm font-bold hover:bg-[#5a1a9a] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : "🤝"}
          {saving ? "Submitting..." : "Submit Application"}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Applications are reviewed within 48 hours. You will receive an email confirmation.
        </p>
      </div>
    </div>
  );
}
