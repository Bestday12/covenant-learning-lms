import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { signupSchema } from "@/features/auth/loginSchema.js";
import { signUp } from "@/services/authService.js";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { Card } from "@/components/ui/Card.jsx";
import Button from "@/components/ui/Button.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { useState } from "react";

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const { user } = await signUp(formData.email, formData.password, formData.fullName);
      setUser(user, "student");
      showToast("Account created!", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <h1 className="font-serif text-2xl font-bold text-brand-800 mb-6">Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Full Name</label>
            <input {...register("fullName")} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Email</label>
            <input {...register("email")} type="email" className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Password</label>
            <input {...register("password")} type="password" className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Confirm Password</label>
            <input {...register("confirmPassword")} type="password" className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>
        <p className="text-sm text-brand-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-accent-600 font-medium">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
