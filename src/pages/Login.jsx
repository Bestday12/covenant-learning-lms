// src/pages/Login.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginSchema } from "@/features/auth/loginSchema.js";
import { signIn } from "@/services/authService.js";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { Card } from "@/components/ui/Card.jsx";
import Button from "@/components/ui/Button.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { useState } from "react";
import { Mail, Lock, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase.js";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { setUser, setProfile, setRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const { user } = await signIn(formData.email, formData.password);

      let resolvedRole = "student";
      let profileData = null;

      if (supabase && user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") throw profileError;

        profileData = profile;
        resolvedRole = profile?.role || "student";
      }

      setUser(user);
      setProfile(profileData);
      setRole(resolvedRole);
      localStorage.setItem("userRole", resolvedRole);

      showToast("Welcome back!", "success");

      const fallbackPath = resolvedRole === "admin" ? "/admin/dashboard" : "/dashboard";
      navigate(location.state?.from?.pathname || fallbackPath);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");
    if (!email) {
      showToast("Please enter your email address first", "error");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setResetSent(true);
      showToast("Password reset email sent — check your inbox", "success");
    } catch (err) {
      showToast(err.message || "Failed to send reset email", "error");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <Card>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-covenant-100 flex items-center justify-center mx-auto mb-4">
            <KeyRound size={22} className="text-covenant-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-800 mb-1">Sign In</h1>
          <p className="text-sm text-brand-500">Access your Covenant Learning courses</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-700">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
              <input
                {...register("email")}
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-brand-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-brand-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading || resetSent}
              className="text-xs text-accent-600 hover:text-accent-700 font-medium disabled:opacity-50"
            >
              {resetLoading ? "Sending..." : resetSent ? "✓ Reset email sent" : "Forgot password?"}
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Temp password hint */}
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="text-xs text-amber-700 text-center">
            <strong>New student?</strong> Check your email for your temporary password, then use "Forgot password?" above to set your own.
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-brand-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-accent-600 hover:text-accent-700">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
