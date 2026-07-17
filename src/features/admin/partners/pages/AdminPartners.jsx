// src/features/admin/partners/pages/AdminPartners.jsx
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { usePartners } from "../hooks/usePartners";
import { useUnlinkPartners } from "../hooks/usePartnerMutations";
import { filterPartners, buildPartnerStats } from "../lib/partnerHelpers";
import PartnerStats from "../components/PartnerStats";
import PartnerFilters from "../components/PartnerFilters";
import PartnerTable from "../components/PartnerTable";
import PartnerDrawer from "../components/PartnerDrawer";
import EmptyPartners from "../components/EmptyPartners";
import LoadingScreen from "@/components/ui/LoadingScreen.jsx";

export default function AdminPartners() {
  const { showToast } = useToast();
  const { data: partners = [], isLoading, isError, error } = usePartners();
  const unlinkMutation = useUnlinkPartners();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter partners
  const filteredPartners = filterPartners(partners, search).filter((p) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "linked") return p.partner_id;
    if (statusFilter === "unlinked") return !p.partner_id;
    if (statusFilter === "pending") return p.invite_code && !p.partner_id;
    return true;
  });

  const stats = buildPartnerStats(partners);

  const handleView = (partner) => {
    setSelectedPartner(partner);
    setDrawerOpen(true);
  };

  const handleCopy = (partner) => {
    const code = partner.invite_code || "No invite code";
    navigator.clipboard.writeText(code);
    showToast("Invite code copied!", "success");
  };

  const handleUnlink = async (partner) => {
    if (!partner.partner_id) {
      showToast("This user is not linked to a partner", "error");
      return;
    }

    if (!confirm(`Remove partner relationship for ${partner.full_name}?`)) return;

    try {
      await unlinkMutation.mutateAsync({
        userId: partner.id,
        partnerId: partner.partner_id,
      });
      showToast("Partner relationship removed", "success");
      setDrawerOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to unlink", "error");
    }
  };

  const handleRefresh = () => {
    // Refetch data
    window.location.reload();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
        <h2 className="text-lg font-semibold text-rose-800">Failed to load partners</h2>
        <p className="mt-1 text-sm text-rose-700">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Partners
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Partner management
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Inspect, review, and repair partner relationships and link states.
        </p>
      </section>

      {/* Stats */}
      <PartnerStats stats={stats} />

      {/* Filters */}
      <PartnerFilters
        search={search}
        setSearch={setSearch}
        status={statusFilter}
        setStatus={setStatusFilter}
        onRefresh={handleRefresh}
      />

      {/* Table or Empty State */}
      {partners.length === 0 ? (
        <EmptyPartners />
      ) : filteredPartners.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">No partners match your filters</p>
        </div>
      ) : (
        <PartnerTable
          partners={filteredPartners}
          onView={handleView}
          onCopy={handleCopy}
          onUnlink={handleUnlink}
        />
      )}

      {/* Drawer */}
      <PartnerDrawer
        open={drawerOpen}
        partner={selectedPartner}
        onClose={() => setDrawerOpen(false)}
        onCopy={handleCopy}
        onUnlink={handleUnlink}
      />
    </div>
  );
}