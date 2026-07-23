// src/features/admin/courses/pages/AdminModuleBuilder.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Save, Trash2, ChevronUp, ChevronDown,
  BookOpen, Loader2, CheckCircle2, AlertCircle, GripVertical,
} from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";

// ── Empty module template ─────────────────────────────────────────────────────
function createEmptyModule(index) {
  return {
    moduleId: `module-${Date.now()}-${index}`,
    moduleTitle: `Module ${index + 1}`,
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
    lessons: [],
  };
}

// ── Module card ───────────────────────────────────────────────────────────────
function ModuleCard({
  module, index, total, isExpanded, onToggle,
  onUpdate, onDelete, onMoveUp, onMoveDown, courseId,
}) {
  const navigate = useNavigate();

  const handleFieldChange = (field, value) => {
    onUpdate(index, { ...module, [field]: value });
  };

  const handleArrayChange = (field, value) => {
    onUpdate(index, { ...module, [field]: value.split("\n").filter(Boolean) });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
        <GripVertical size={16} className="text-slate-300 flex-shrink-0" />
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {isExpanded ? (
            <input
              type="text"
              value={module.moduleTitle}
              onChange={(e) => handleFieldChange("moduleTitle", e.target.value)}
              className="w-full text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400"
              placeholder="Module title..."
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 truncate">{module.moduleTitle}</p>
          )}
          {module.moduleTheme && !isExpanded && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{module.moduleTheme}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/courses/${courseId}/modules/${module.moduleId}/lessons`)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit lessons"
          >
            Lessons
          </button>
          <button
            type="button"
            onClick={() => onToggle(index)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {isExpanded ? "Collapse" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors"
            title="Delete module"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded edit area */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Module Theme / Subtitle
              </label>
              <input
                type="text"
                value={module.moduleTheme || ""}
                onChange={(e) => handleFieldChange("moduleTheme", e.target.value)}
                placeholder="e.g. What the first year is really like"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
              />
            </div>

            {/* Memory Statement */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Memory Statement
              </label>
              <input
                type="text"
                value={module.memoryStatement || ""}
                onChange={(e) => handleFieldChange("memoryStatement", e.target.value)}
                placeholder="The key takeaway for this module"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* Welcome Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Welcome Text
            </label>
            <textarea
              value={module.welcomeText || ""}
              onChange={(e) => handleFieldChange("welcomeText", e.target.value)}
              placeholder="Opening paragraph students see when they start this module..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Teaching Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Teaching Notes <span className="text-slate-400 normal-case font-normal">(one per line)</span>
              </label>
              <textarea
                value={(module.teachingNotes || []).join("\n")}
                onChange={(e) => handleArrayChange("teachingNotes", e.target.value)}
                placeholder="First teaching point&#10;Second teaching point&#10;Third teaching point"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>

            {/* Key Scriptures */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Key Scriptures <span className="text-slate-400 normal-case font-normal">(one per line)</span>
              </label>
              <textarea
                value={(module.keyScriptures || []).join("\n")}
                onChange={(e) => handleArrayChange("keyScriptures", e.target.value)}
                placeholder="John 3:16&#10;Proverbs 4:7&#10;Ecclesiastes 4:9"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>

            {/* Personal Reflection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Personal Reflection Questions <span className="text-slate-400 normal-case font-normal">(one per line)</span>
              </label>
              <textarea
                value={(module.personalReflection || []).join("\n")}
                onChange={(e) => handleArrayChange("personalReflection", e.target.value)}
                placeholder="What surprised you most this week?&#10;Where do you need to grow?"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>

            {/* Couple Discussion */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Couple Discussion Questions <span className="text-slate-400 normal-case font-normal">(one per line)</span>
              </label>
              <textarea
                value={(module.coupleDiscussion || []).join("\n")}
                onChange={(e) => handleArrayChange("coupleDiscussion", e.target.value)}
                placeholder="What did you learn about yourself?&#10;How can we grow together?"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>
          </div>

          {/* Couple Exercise */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Couple Exercise
            </label>
            <textarea
              value={module.coupleExercise || ""}
              onChange={(e) => handleFieldChange("coupleExercise", e.target.value)}
              placeholder="Describe the practical exercise for this module..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prayer Focus */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Prayer Focus
              </label>
              <textarea
                value={module.prayerFocus || ""}
                onChange={(e) => handleFieldChange("prayerFocus", e.target.value)}
                placeholder="The prayer focus for this module..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>

            {/* Weekly Action Step */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Weekly Action Step
              </label>
              <textarea
                value={module.weeklyActionStep || ""}
                onChange={(e) => handleFieldChange("weeklyActionStep", e.target.value)}
                placeholder="The practical step for this week..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>
          </div>

          {/* Module ID (read-only) */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Module ID: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{module.moduleId}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminModuleBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Load course and modules
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select("id, title, modules")
          .eq("id", courseId)
          .single();

        if (error) throw error;
        setCourse(data);
        setModules(Array.isArray(data.modules) ? data.modules : []);
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    }
    if (courseId) load();
  }, [courseId]);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleUpdate = useCallback((index, updatedModule) => {
    setModules((prev) => prev.map((m, i) => (i === index ? updatedModule : m)));
    setSaved(false);
  }, []);

  const handleDelete = (index) => {
    if (!window.confirm(`Delete Module ${index + 1}? This cannot be undone.`)) return;
    setModules((prev) => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
    setSaved(false);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setModules((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
    setSaved(false);
  };

  const handleMoveDown = (index) => {
    if (index === modules.length - 1) return;
    setModules((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
    setSaved(false);
  };

  const handleAddModule = () => {
    const newModule = createEmptyModule(modules.length);
    setModules((prev) => [...prev, newModule]);
    setExpandedIndex(modules.length);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          modules,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId);

      if (error) throw error;

      setSaved(true);
      showToast(`${modules.length} modules saved successfully!`, "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast(err.message || "Failed to save modules", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={14} /> Back to courses
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-center gap-3">
          <AlertCircle className="text-rose-600" size={20} />
          <p className="text-rose-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={`/admin/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-3"
          >
            <ArrowLeft size={14} /> Back to course
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Module Builder</h1>
          <p className="text-sm text-slate-500 mt-1">
            {course?.title} · {modules.length} module{modules.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddModule}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus size={15} /> Add Module
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={15} className="text-emerald-400" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save All Modules"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Modules", value: modules.length },
          { label: "With Teaching Notes", value: modules.filter((m) => m.teachingNotes?.length > 0).length },
          { label: "With Prayer Focus", value: modules.filter((m) => m.prayerFocus).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Module list */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-2">No modules yet</p>
          <p className="text-slate-400 text-sm mb-6">Add your first module to get started building this course.</p>
          <button
            onClick={handleAddModule}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} /> Add First Module
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.moduleId || index}
              module={module}
              index={index}
              total={modules.length}
              isExpanded={expandedIndex === index}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              courseId={courseId}
            />
          ))}

          {/* Add module button at bottom */}
          <button
            onClick={handleAddModule}
            className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={15} /> Add Another Module
          </button>
        </div>
      )}

      {/* Bottom save bar */}
      {modules.length > 0 && (
        <div className="sticky bottom-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-lg transition-colors"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving..." : `Save ${modules.length} Modules`}
          </button>
        </div>
      )}

    </div>
  );
}
