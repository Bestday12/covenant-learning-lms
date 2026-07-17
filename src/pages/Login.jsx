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
import { Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase.js";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { setUser, setProfile, setRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

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

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        profileData = profile;
        resolvedRole = profile?.role || "student";
      }

      // Set user, profile, and role separately
      setUser(user);
      setProfile(profileData);
      setRole(resolvedRole);

      // Store role in localStorage for quick access
      localStorage.setItem("userRole", resolvedRole);

      showToast("Welcome back!", "success");

      const fallbackPath =
        resolvedRole === "admin"
          ? "/admin/dashboard"
          : "/dashboard";

      navigate(location.state?.from?.pathname || fallbackPath);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <h1 className="mb-6 font-serif text-2xl font-bold text-brand-800">Sign In</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-700">Email</label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
              />
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-lg border border-brand-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-700">Password</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
              />
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-lg border border-brand-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-brand-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-accent-600">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}