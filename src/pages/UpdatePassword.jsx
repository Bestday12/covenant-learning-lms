import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase.js";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  const passwordValid = useMemo(() => password.trim().length >= 8, [password]);
  const passwordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  );

  useEffect(() => {
    let mounted = true;

    async function initRecovery() {
      if (!supabase) {
        if (mounted) {
          setReady(true);
          setChecking(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setReady(true);
        setChecking(false);
      } else {
        setChecking(false);
      }
    }

    initRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setChecking(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!passwordValid) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (!passwordsMatch) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="mb-3 text-3xl font-bold text-slate-900">
        Choose a New Password
      </h1>

      <p className="mb-6 text-sm text-slate-500">
        Enter a new password for your account.
      </p>

      {checking ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Checking your recovery session...
        </div>
      ) : !ready ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Your recovery link is missing or expired. Please open the reset link from your email again.
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
          >
            Back to login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-3 text-white disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p className={passwordValid ? "text-emerald-700" : ""}>
              - At least 8 characters
            </p>
            <p className={passwordsMatch ? "text-emerald-700" : ""}>
              - Passwords must match
            </p>
          </div>

          {message && <p className="text-center text-sm text-slate-600">{message}</p>}
        </form>
      )}
    </div>
  );
}