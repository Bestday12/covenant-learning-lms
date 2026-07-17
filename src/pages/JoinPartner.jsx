import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import Button from "@/components/ui/Button.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { supabase } from "@/lib/supabase.js";
import { Heart } from "lucide-react";

export default function JoinPartner() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("link_partner_by_code", {
        code: code.trim().toUpperCase(),
      });
      if (error) throw error;

      await refreshProfile();

      showToast(`You're now linked with ${data.partner_name || "your partner"}!`, "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Could not link accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <Card>
        <CardHeader
          title="Link With Your Partner"
          subtitle="Enter the code your partner shared with you to connect your accounts."
          action={<Heart className="text-accent-500" size={20} />}
        />
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter invite code"
            maxLength={6}
            className="w-full rounded-lg border border-brand-200 px-4 py-3 text-center font-serif text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <Button type="submit" loading={loading} className="w-full">
            Link Accounts
          </Button>
        </form>
      </Card>
    </div>
  );
}