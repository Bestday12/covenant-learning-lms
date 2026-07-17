import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import Button from "@/components/ui/Button.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { Copy, Heart, Check, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase.js";

export default function InvitePartner() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [inviteCode, setInviteCode] = useState(user?.user_metadata?.invite_code || null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const partnerLinked = !!user?.user_metadata?.partner_id;

  const generateCode = async () => {
    setGenerating(true);
    try {
      // RPC returns a plain text value (the code string), not an object
      const { data, error } = await supabase.rpc("generate_invite_code");
      if (error) throw error;
      // data is the code string directly
      const code = typeof data === "string" ? data : data?.code ?? data;
      setInviteCode(code);
      showToast("Invite code generated!", "success");
    } catch (err) {
      showToast(err.message || "Could not generate code", "error");
    } finally {
      setGenerating(false);
    }
  };

  const inviteLink = inviteCode
    ? `${window.location.origin}/join-partner?code=${inviteCode}`
    : null;

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    showToast("Link copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (partnerLinked) {
    return (
      <Card>
        <CardHeader title="Your Partner" action={<Heart className="text-accent-500" size={20} />} />
        <p className="text-brand-600 text-sm">
          You're linked with{" "}
          <span className="font-semibold text-brand-800">
            {user.user_metadata.partner_name ||
              user.user_metadata.partner_email ||
              "your partner"}
          </span>
          . Shared answers will appear together in your Discussion tabs.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Invite Your Partner"
        subtitle="Link accounts to share progress and discussion answers together."
        action={<UserPlus className="text-accent-500" size={20} />}
      />
      {!inviteCode ? (
        <Button onClick={generateCode} loading={generating}>
          Generate Invite Link
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm bg-brand-50 text-brand-700"
            />
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg border border-brand-200 hover:border-accent-500 transition-colors"
              aria-label="Copy invite link"
            >
              {copied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} className="text-brand-600" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-brand-50 rounded-lg px-4 py-3">
            <span className="text-xs text-brand-500 font-medium">Or share this code:</span>
            <span className="font-serif font-bold text-lg text-accent-600 tracking-widest">
              {inviteCode}
            </span>
          </div>
          <p className="text-xs text-brand-400">
            Your partner can enter this code after signing up to link your accounts.
          </p>
        </div>
      )}
    </Card>
  );
}
