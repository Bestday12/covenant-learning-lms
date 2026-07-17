// src/features/admin/courses/pages/AdminCreateCourse.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import Button from "@/components/ui/Button.jsx";

export default function AdminCreateCourse() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, session } = useAuth(); // Add session
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id || !formData.title) {
      showToast("Course ID and Title are required", "error");
      return;
    }

    // Check if user is authenticated
    if (!user) {
      showToast("You must be logged in to create a course", "error");
      return;
    }

    console.log('🔍 Creating course with user:', user.email);
    console.log('🔍 Course data:', formData);

    setLoading(true);

    try {
      // Get fresh session to ensure valid token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Session expired. Please log in again.');
      }

      if (!freshSession) {
        throw new Error('No active session. Please log in.');
      }

      console.log('✅ Session valid for:', freshSession.user.email);

      // Use the fresh session token
      const { data, error } = await supabase
        .from("courses")
        .insert({
          id: formData.id,
          title: formData.title,
          description: formData.description,
          modules: [],
          bonus_resources: {},
        })
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Course created:', data);
      showToast("Course created successfully!", "success");
      navigate(`/admin/courses/${formData.id}`);
    } catch (error) {
      console.error("❌ Error creating course:", error);
      
      // More specific error messages
      if (error.code === 'PGRST301') {
        showToast("Permission denied. Please check your admin privileges.", "error");
      } else if (error.message?.includes('session')) {
        showToast("Your session has expired. Please log in again.", "error");
      } else {
        showToast(error.message || "Failed to create course", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/courses")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create New Course</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter the basic details for your new course.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Course ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="e.g., blended-family-foundations"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              Use lowercase letters, hyphens, and numbers only (no spaces).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Blended Family Foundations"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the course..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={loading}>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/courses")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}