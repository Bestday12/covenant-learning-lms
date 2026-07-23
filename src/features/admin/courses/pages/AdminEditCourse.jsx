// src/features/admin/courses/pages/AdminEditCourse.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";

// ── Inline simple form (avoids CourseForm complexity) ────────────────────────

function CourseBasicForm({ data, onChange }) {
  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. The Covenant Marriage Foundation"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <textarea
          value={data.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="A brief description of this course..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Price + Stripe Price ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (£)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.price || ""}
            onChange={(e) => onChange("price", parseFloat(e.target.value) || 0)}
            placeholder="97"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Stripe Price ID</label>
          <input
            type="text"
            value={data.stripe_price_id || ""}
            onChange={(e) => onChange("stripe_price_id", e.target.value)}
            placeholder="price_1..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Instructor + Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Instructor</label>
          <input
            type="text"
            value={data.instructor || ""}
            onChange={(e) => onChange("instructor", e.target.value)}
            placeholder="Reverend Sam Adeyemi"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Level</label>
          <select
            value={data.level || ""}
            onChange={(e) => onChange("level", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
          >
            <option value="">Select level...</option>
            <option value="All levels">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Category + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          <select
            value={data.category || ""}
            onChange={(e) => onChange("category", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
          >
            <option value="">Select category...</option>
            <option value="Marriage">Marriage</option>
            <option value="Pre-Marital">Pre-Marital</option>
            <option value="Parenting">Parenting</option>
            <option value="Communication">Communication</option>
            <option value="Restoration">Restoration</option>
            <option value="Discipleship">Discipleship</option>
            <option value="Family">Family</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
          <input
            type="text"
            value={data.duration || ""}
            onChange={(e) => onChange("duration", e.target.value)}
            placeholder="e.g. 8 weeks, 10 modules"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}

// ── Inline module editor ──────────────────────────────────────────────────────

function ModuleEditor({ modules, onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddModule = () => {
    const newModule = {
      moduleId: `module-${Date.now()}`,
      moduleTitle: `Module ${modules.length + 1}`,
      moduleTheme: "",
      welcomeText: "",
      memoryStatement: "",
      teachingNotes: [],
      keyScriptures: [],
      personalReflection: [],
      coupleDiscussion: [],
      coupleExercise: "",
      prayerFocus: "",
      weeklyActionStep: "",
      worksheets: [],
    };
    onChange([...modules, newModule]);
    setEditingIndex(modules.length);
  };

  const handleDeleteModule = (index) => {
    if (!window.confirm(`Delete Module ${index + 1}? This cannot be undone.`)) return;
    const updated = modules.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleUpdateModule = (index, field, value) => {
    const updated = modules.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    onChange(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...modules];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index) => {
    if (index === modules.length - 1) return;
    const updated = [...modules];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {modules.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500 mb-4">No modules yet. Add your first module to get started.</p>
          <button
            type="button"
            onClick={handleAddModule}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add First Module
          </button>
        </div>
      )}

      {modules.map((module, index) => (
        <div key={module.moduleId || index} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Module header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 flex-shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              {editingIndex === index ? (
                <input
                  type="text"
                  value={module.moduleTitle || ""}
                  onChange={(e) => handleUpdateModule(index, "moduleTitle", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium focus:border-indigo-400 focus:outline-none"
                  autoFocus
                />
              ) : (
                <p className="text-sm font-medium text-slate-900 truncate">{module.moduleTitle || `Module ${index + 1}`}</p>
              )}
              {module.moduleTheme && editingIndex !== index && (
                <p className="text-xs text-slate-400 truncate">{module.moduleTheme}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => handleMoveUp(index)} disabled={index === 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30">↑</button>
              <button type="button" onClick={() => handleMoveDown(index)} disabled={index === modules.length - 1} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30">↓</button>
              <button
                type="button"
                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
              >
                {editingIndex === index ? "Done" : "Edit"}
              </button>
              <button type="button" onClick={() => handleDeleteModule(index)} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50">
                ✕
              </button>
            </div>
          </div>

          {/* Expanded edit fields */}
          {editingIndex === index && (
            <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-slate-50/50">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Module Theme / Subtitle</label>
                <input
                  type="text"
                  value={module.moduleTheme || ""}
                  onChange={(e) => handleUpdateModule(index, "moduleTheme", e.target.value)}
                  placeholder="e.g. What the first year is really like"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Welcome Text</label>
                <textarea
                  value={module.welcomeText || ""}
                  onChange={(e) => handleUpdateModule(index, "welcomeText", e.target.value)}
                  placeholder="Opening paragraph students see when they start this module..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Memory Statement</label>
                <input
                  type="text"
                  value={module.memoryStatement || ""}
                  onChange={(e) => handleUpdateModule(index, "memoryStatement", e.target.value)}
                  placeholder="The key takeaway statement for this module"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prayer Focus</label>
                <textarea
                  value={module.prayerFocus || ""}
                  onChange={(e) => handleUpdateModule(index, "prayerFocus", e.target.value)}
                  placeholder="The prayer for this module..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Weekly Action Step</label>
                <input
                  type="text"
                  value={module.weeklyActionStep || ""}
                  onChange={(e) => handleUpdateModule(index, "weeklyActionStep", e.target.value)}
                  placeholder="The practical step for this week"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Key Scriptures <span className="text-slate-400">(one per line)</span>
                </label>
                <textarea
                  value={(module.keyScriptures || []).join("\n")}
                  onChange={(e) => handleUpdateModule(index, "keyScriptures", e.target.value.split("\n").filter(Boolean))}
                  placeholder="John 3:16&#10;Proverbs 4:7"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Personal Reflection Questions <span className="text-slate-400">(one per line)</span>
                </label>
                <textarea
                  value={(module.personalReflection || []).join("\n")}
                  onChange={(e) => handleUpdateModule(index, "personalReflection", e.target.value.split("\n").filter(Boolean))}
                  placeholder="What surprised you most this week?&#10;Where do you need to grow?"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Couple Discussion Questions <span className="text-slate-400">(one per line)</span>
                </label>
                <textarea
                  value={(module.coupleDiscussion || []).join("\n")}
                  onChange={(e) => handleUpdateModule(index, "coupleDiscussion", e.target.value.split("\n").filter(Boolean))}
                  placeholder="What did you learn about yourself?&#10;How can we grow together?"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {modules.length > 0 && (
        <button
          type="button"
          onClick={handleAddModule}
          className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          + Add Module
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminEditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [courseData, setCourseData] = useState({
  title: "",
  description: "",
  price: 0,
  stripe_price_id: "",
  instructor: "Reverend Sam Adeyemi",
  level: "All levels",
  category: "Marriage",
  duration: "",
});
  const [modules, setModules] = useState([]);

  // Load existing course
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (error) throw error;

        setCourseData({
  title: data.title || "",
  description: data.description || "",
  price: data.price || 0,
  stripe_price_id: data.stripe_price_id || "",
  instructor: data.instructor || "Reverend Sam Adeyemi",
  level: data.level || "All levels",
  category: data.category || "Marriage",
  duration: data.duration || "",
});
setModules(Array.isArray(data.modules) ? data.modules : []);
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    }
    if (courseId) load();
  }, [courseId]);

  const handleFieldChange = useCallback((field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!courseData.title.trim()) {
      showToast("Course title is required", "error");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title: courseData.title.trim(),
          description: courseData.description.trim(),
          price: courseData.price || 0,
          stripe_price_id: courseData.stripe_price_id || null,
          modules: modules,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId);

      if (error) throw error;

      setSaved(true);
      showToast("Course saved successfully!", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast(err.message || "Failed to save course", "error");
    } finally {
      setSaving(false);
    }
  }, [courseId, courseData, modules, showToast]);

  const handlePublish = useCallback(async () => {
    if (!window.confirm("Publish this course? It will be visible to all students.")) return;
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title: courseData.title.trim(),
          description: courseData.description.trim(),
          price: courseData.price || 0,
          stripe_price_id: courseData.stripe_price_id || null,
          modules: modules,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId);

      if (error) throw error;

      showToast("Course published successfully!", "success");
      navigate(`/admin/courses/${courseId}`);
    } catch (err) {
      showToast(err.message || "Failed to publish", "error");
    } finally {
      setPublishing(false);
    }
  }, [courseId, courseData, modules, navigate, showToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate("/admin/courses")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <p className="text-rose-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/admin/courses/${courseId}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back to course
          </button>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Edit: {courseData.title || courseId}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ID: <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{courseId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            {publishing ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Basic details */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Course Details</h2>
            <CourseBasicForm data={courseData} onChange={handleFieldChange} />
          </div>

          {/* Modules */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Modules</h2>
                <p className="text-sm text-slate-500">{modules.length} module{modules.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <ModuleEditor modules={modules} onChange={setModules} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Course summary */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sticky top-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Course Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Course ID</span>
                <span className="font-mono text-xs text-slate-700 bg-slate-50 px-2 py-0.5 rounded">{courseId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Modules</span>
                <span className="font-semibold text-slate-900">{modules.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Price</span>
                <span className="font-semibold text-slate-900">
                  {courseData.price ? `£${courseData.price}` : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Stripe ID</span>
                <span className={`text-xs font-mono ${courseData.stripe_price_id ? "text-emerald-600" : "text-slate-400"}`}>
                  {courseData.stripe_price_id ? "✓ Set" : "Not set"}
                </span>
              </div>
            </div>

            {/* Quick tips */}
            <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">💡 Tips</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Save often with "Save Changes"</li>
                <li>• Add modules and expand to edit content</li>
                <li>• Set Stripe Price ID to enable payments</li>
                <li>• "Save & Publish" saves and marks live</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
