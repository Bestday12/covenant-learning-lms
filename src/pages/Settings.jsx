import { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import Button from "@/components/ui/Button.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { supabase } from "@/lib/supabase.js";
import InvitePartner from "@/features/settings/InvitePartner.jsx";
import {
  User,
  Lock,
  Bell,
  ShieldCheck,
  LogOut,
  Camera,
  Mail,
  Trash2,
} from "lucide-react";
import { signOut } from "@/services/authService.js";
import { useNavigate } from "react-router-dom";

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={<Icon className="text-accent-500" size={20} />}
      />
      {children}
    </Card>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-brand-800">{label}</p>
        {description && <p className="text-xs text-brand-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
          checked ? "bg-accent-500" : "bg-brand-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function Settings() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [emailReminders, setEmailReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
  if (user?.user_metadata?.full_name) {
    setFullName(user.user_metadata.full_name);
  } else if (user?.user_metadata?.fullname) {
    setFullName(user.user_metadata.fullname);
  }
}, [user]);

  const initials = (fullName || user?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (supabase) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: fullName },
        });
        if (authError) throw authError;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("id", user.id);
        if (profileError) throw profileError;
      }
    setUser({
  ...user,
  user_metadata: {
    ...user.user_metadata,
    full_name: fullName,
  },
});
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err.message || "Could not update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords don't match", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    setSavingPassword(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      showToast("Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message || "Could not update password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      if (supabase) {
        await supabase.auth.updateUser({
          data: { email_reminders: emailReminders, weekly_digest: weeklyDigest },
        });
      }
      showToast("Preferences saved", "success");
    } catch (err) {
      showToast(err.message || "Could not save preferences", "error");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-800 mb-1">Settings</h1>
        <p className="text-brand-500">Manage your account, partner, and preferences.</p>
      </div>

      {/* Profile */}
      <SectionCard
        icon={User}
        title="Profile"
        subtitle="This information may be shown on your certificate."
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-serif font-bold text-xl">
              {initials}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 bg-white border border-brand-200 rounded-full p-1.5 hover:border-accent-500 transition-colors"
              title="Avatar upload coming soon"
            >
              <Camera size={12} className="text-brand-500" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-brand-800">{fullName || "Add your name"}</p>
            <p className="text-sm text-brand-400 flex items-center gap-1">
              <Mail size={12} /> {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm bg-brand-50 text-brand-400"
            />
            <p className="text-xs text-brand-400 mt-1">Contact support to change your email address.</p>
          </div>
          <Button type="submit" size="sm" loading={savingProfile}>
            Save Profile
          </Button>
        </form>
      </SectionCard>

      {/* Partner Pairing */}
      <InvitePartner />

      {/* Password */}
      <SectionCard
        icon={Lock}
        title="Password"
        subtitle="Update the password you use to sign in."
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" loading={savingPassword}>
            Update Password
          </Button>
        </form>
      </SectionCard>

      {/* Notifications */}
      <SectionCard
        icon={Bell}
        title="Notifications"
        subtitle="Choose what you'd like to hear from us about."
      >
        <div className="divide-y divide-brand-50">
          <Toggle
            checked={emailReminders}
            onChange={setEmailReminders}
            label="Progress reminders"
            description="Gentle nudges if you haven't opened a module in a while."
          />
          <Toggle
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
            label="Weekly digest"
            description="A short summary of your progress and upcoming modules."
          />
        </div>
        <Button size="sm" className="mt-4" onClick={handleSavePrefs} loading={savingPrefs}>
          Save Preferences
        </Button>
      </SectionCard>

      {/* Account / Danger Zone */}
      <SectionCard
        icon={ShieldCheck}
        title="Account"
        subtitle="Manage your session and account data."
      >
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut size={14} /> Sign Out
          </Button>
        </div>

        <div className="border-t border-red-100 pt-5">
          <p className="text-sm font-semibold text-red-600 mb-1">Delete Account</p>
          <p className="text-xs text-brand-400 mb-3">
            This permanently removes your progress, certificates, and partner link. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 text-sm text-red-600 font-medium hover:text-red-700"
            >
              <Trash2 size={14} /> Delete my account
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-brand-700">Are you sure?</p>
              <button
                onClick={() => showToast("Account deletion requires admin approval — contact support.", "info")}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm text-brand-400 hover:text-brand-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
