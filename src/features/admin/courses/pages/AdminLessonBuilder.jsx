// src/features/admin/courses/pages/AdminLessonBuilder.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Save, Trash2, ChevronUp, ChevronDown,
  Loader2, CheckCircle2, AlertCircle, GripVertical,
  Video, FileText, BookOpen, HelpCircle, ClipboardList, CheckSquare,
} from "lucide-react";
// Note: VisualQuizBuilder uses useState internally
import { supabase } from "@/lib/supabase.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";

// ── Lesson type config ────────────────────────────────────────────────────────
const LESSON_TYPES = [
  { value: "video", label: "Video", icon: Video, color: "text-red-500 bg-red-50" },
  { value: "text", label: "Teaching", icon: BookOpen, color: "text-indigo-500 bg-indigo-50" },
  { value: "pdf", label: "PDF Download", icon: FileText, color: "text-amber-500 bg-amber-50" },
  { value: "quiz", label: "Quiz", icon: HelpCircle, color: "text-purple-500 bg-purple-50" },
  { value: "worksheet", label: "Worksheet", icon: ClipboardList, color: "text-green-500 bg-green-50" },
  { value: "completion", label: "Completion", icon: CheckSquare, color: "text-emerald-500 bg-emerald-50" },
];

function getLessonType(value) {
  return LESSON_TYPES.find((t) => t.value === value) || LESSON_TYPES[0];
}

// ── Visual Quiz Builder ───────────────────────────────────────────────────────
function VisualQuizBuilder({ content, onChange }) {
  // Parse existing questions from JSON content
  const parseQuestions = () => {
    try {
      const parsed = JSON.parse(content || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [questions, setQuestions] = useState(parseQuestions);

  const updateContent = (updatedQuestions) => {
    setQuestions(updatedQuestions);
    onChange(JSON.stringify(updatedQuestions, null, 2));
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
    };
    updateContent([...questions, newQuestion]);
  };

  const updateQuestion = (qIndex, field, value) => {
    const updated = questions.map((q, i) =>
      i === qIndex ? { ...q, [field]: value } : q
    );
    updateContent(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = questions.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = [...q.options];
      newOptions[oIndex] = value;
      return { ...q, options: newOptions };
    });
    updateContent(updated);
  };

  const addOption = (qIndex) => {
    const updated = questions.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: [...q.options, ""] };
    });
    updateContent(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = questions.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = q.options.filter((_, oi) => oi !== oIndex);
      const newCorrect = q.correct >= oIndex && q.correct > 0 ? q.correct - 1 : q.correct;
      return { ...q, options: newOptions, correct: newCorrect };
    });
    updateContent(updated);
  };

  const removeQuestion = (qIndex) => {
    updateContent(questions.filter((_, i) => i !== qIndex));
  };

  const moveQuestion = (qIndex, direction) => {
    const updated = [...questions];
    const targetIndex = qIndex + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    [updated[qIndex], updated[targetIndex]] = [updated[targetIndex], updated[qIndex]];
    updateContent(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Quiz Questions
          </label>
          <p className="text-xs text-slate-400 mt-0.5">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
        >
          <Plus size={12} /> Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <HelpCircle size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-1">No questions yet</p>
          <p className="text-xs text-slate-400 mb-4">Add your first quiz question</p>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
          >
            <Plus size={12} /> Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {/* Question header */}
              <div className="flex items-start gap-3 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 flex-shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                    placeholder="Type your question here..."
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-purple-400 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => moveQuestion(qIndex, -1)} disabled={qIndex === 0} className="p-1 rounded text-slate-400 hover:bg-slate-200 disabled:opacity-30">
                    <ChevronUp size={12} />
                  </button>
                  <button type="button" onClick={() => moveQuestion(qIndex, 1)} disabled={qIndex === questions.length - 1} className="p-1 rounded text-slate-400 hover:bg-slate-200 disabled:opacity-30">
                    <ChevronDown size={12} />
                  </button>
                  <button type="button" onClick={() => removeQuestion(qIndex)} className="p-1 rounded text-rose-400 hover:bg-rose-50">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-9 mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Answer Options <span className="text-slate-400 normal-case font-normal">(click ● to mark correct)</span>
                </p>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIndex, "correct", oIndex)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        q.correct === oIndex
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-300 hover:border-emerald-400"
                      }`}
                      title="Mark as correct answer"
                    >
                      {q.correct === oIndex && (
                        <CheckCircle2 size={12} className="text-white m-auto" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}...`}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none ${
                        q.correct === oIndex
                          ? "border-emerald-300 bg-emerald-50 focus:border-emerald-400"
                          : "border-slate-200 bg-white focus:border-purple-400"
                      }`}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="p-1 rounded text-slate-300 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="ml-7 text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    + Add option
                  </button>
                )}
              </div>

              {/* Explanation */}
              <div className="ml-9">
                <input
                  type="text"
                  value={q.explanation || ""}
                  onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                  placeholder="Explanation shown after answering (optional)..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {/* Correct answer indicator */}
              {q.options[q.correct] && (
                <div className="ml-9 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} /> Correct: {q.options[q.correct]}
                  </span>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-medium text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-colors"
          >
            + Add Another Question
          </button>
        </div>
      )}
    </div>
  );
}

// ── Lesson content editor based on type ──────────────────────────────────────
function LessonContentEditor({ type, content, onChange }) {
  switch (type) {
    case "video":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Video URL (YouTube or Vimeo)
            </label>
            <input
              type="url"
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
            />
          </div>
          {content && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500 mb-1">Preview URL:</p>
              <a href={content} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 break-all hover:underline">
                {content}
              </a>
            </div>
          )}
        </div>
      );

    case "text":
      return (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Teaching Content
          </label>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write the teaching content for this lesson. You can use plain text or basic markdown..."
            rows={8}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-y"
          />
          <p className="text-xs text-slate-400 mt-1">{content?.length || 0} characters</p>
        </div>
      );

    case "pdf":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              PDF URL or File Name
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or worksheet-name.pdf"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
            />
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-xs text-amber-700">
              💡 Upload your PDF to Supabase Storage or an external host, then paste the URL here.
            </p>
          </div>
        </div>
      );

    case "quiz":
      return <VisualQuizBuilder content={content} onChange={onChange} />;

    case "worksheet":
      return (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Worksheet Fields (one per line)
          </label>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`What is your biggest takeaway from this module?
How will you apply this to your marriage this week?
Write a prayer for your spouse based on what you learned:`}
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-y"
          />
          <p className="text-xs text-slate-400 mt-1">Each line becomes a separate worksheet question with a text area for the student to fill in.</p>
        </div>
      );

    case "completion":
      return (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Completion Message
          </label>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Well done on completing this module! Take a moment to reflect on what you have learned before moving on..."
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 resize-none"
          />
        </div>
      );

    default:
      return null;
  }
}

// ── Lesson card ───────────────────────────────────────────────────────────────
function LessonCard({
  lesson, index, total, isExpanded, onToggle,
  onUpdate, onDelete, onMoveUp, onMoveDown, saving,
}) {
  const typeConfig = getLessonType(lesson.lesson_type);
  const Icon = typeConfig.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
        <GripVertical size={16} className="text-slate-300 flex-shrink-0" />

        {/* Type icon */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
          <Icon size={14} />
        </div>

        {/* Order + title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold text-slate-400">{index + 1}.</span>
        </div>

        <div className="flex-1 min-w-0">
          {isExpanded ? (
            <input
              type="text"
              value={lesson.lesson_title || ""}
              onChange={(e) => onUpdate({ ...lesson, lesson_title: e.target.value })}
              className="w-full text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400"
              placeholder="Lesson title..."
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 truncate">
              {lesson.lesson_title || "Untitled Lesson"}
            </p>
          )}
          {!isExpanded && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${typeConfig.color}`}>
              <Icon size={10} /> {typeConfig.label}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button type="button" onClick={() => onMoveUp(index)} disabled={index === 0} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30">
            <ChevronUp size={14} />
          </button>
          <button type="button" onClick={() => onMoveDown(index)} disabled={index === total - 1} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30">
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => onToggle(index)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {isExpanded ? "Collapse" : "Edit"}
          </button>
          <button type="button" onClick={() => onDelete(lesson)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Lesson type selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Lesson Type
            </label>
            <div className="flex flex-wrap gap-2">
              {LESSON_TYPES.map((t) => {
                const T = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => onUpdate({ ...lesson, lesson_type: t.value, lesson_content: "" })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      lesson.lesson_type === t.value
                        ? `${t.color} border-current`
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <T size={12} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content editor */}
          <LessonContentEditor
            type={lesson.lesson_type}
            content={lesson.lesson_content || ""}
            onChange={(value) => onUpdate({ ...lesson, lesson_content: value })}
          />

          {/* Save individual lesson */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onUpdate(lesson, true)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminLessonBuilder() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [error, setError] = useState("");

  // Load course, module info and lessons
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Load course to get module info
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title, modules")
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Find the module
        const modules = Array.isArray(courseData.modules) ? courseData.modules : [];
        const mod = modules.find((m) => m.moduleId === moduleId);
        setModuleData(mod || { moduleId, moduleTitle: moduleId });

        // Load lessons for this module
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .eq("module_id", moduleId)
          .order("order", { ascending: true });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

      } catch (err) {
        setError(err.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    }
    if (courseId && moduleId) load();
  }, [courseId, moduleId]);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleAddLesson = () => {
    const newLesson = {
      id: `temp-${Date.now()}`,
      course_id: courseId,
      module_id: moduleId,
      lesson_title: `Lesson ${lessons.length + 1}`,
      lesson_content: "",
      lesson_type: "text",
      order: lessons.length + 1,
      isNew: true,
    };
    setLessons((prev) => [...prev, newLesson]);
    setExpandedIndex(lessons.length);
  };

  const handleUpdate = useCallback(async (updatedLesson, saveNow = false) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
    );

    if (!saveNow) return;

    setSaving(true);
    try {
      if (updatedLesson.isNew) {
        // Insert new lesson
        const { data, error } = await supabase
          .from("lessons")
          .insert({
            course_id: courseId,
            module_id: moduleId,
            lesson_title: updatedLesson.lesson_title,
            lesson_content: updatedLesson.lesson_content,
            lesson_type: updatedLesson.lesson_type,
            order: updatedLesson.order,
          })
          .select()
          .single();

        if (error) throw error;

        // Replace temp lesson with saved one
        setLessons((prev) =>
          prev.map((l) => (l.id === updatedLesson.id ? { ...data } : l))
        );
        showToast("Lesson created!", "success");
      } else {
        // Update existing
        const { error } = await supabase
          .from("lessons")
          .update({
            lesson_title: updatedLesson.lesson_title,
            lesson_content: updatedLesson.lesson_content,
            lesson_type: updatedLesson.lesson_type,
            order: updatedLesson.order,
          })
          .eq("id", updatedLesson.id);

        if (error) throw error;
        showToast("Lesson saved!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to save lesson", "error");
    } finally {
      setSaving(false);
    }
  }, [courseId, moduleId, showToast]);

  const handleDelete = async (lesson) => {
    if (!window.confirm(`Delete "${lesson.lesson_title}"? This cannot be undone.`)) return;

    if (!lesson.isNew) {
      const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
      if (error) { showToast("Failed to delete lesson", "error"); return; }
    }

    setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
    showToast("Lesson deleted", "success");
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setLessons((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated.map((l, i) => ({ ...l, order: i + 1 }));
    });
  };

  const handleMoveDown = (index) => {
    if (index === lessons.length - 1) return;
    setLessons((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((l, i) => ({ ...l, order: i + 1 }));
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const lesson of lessons) {
        if (lesson.isNew) {
          const { data, error } = await supabase
            .from("lessons")
            .insert({
              course_id: courseId,
              module_id: moduleId,
              lesson_title: lesson.lesson_title,
              lesson_content: lesson.lesson_content,
              lesson_type: lesson.lesson_type,
              order: lesson.order,
            })
            .select()
            .single();
          if (error) throw error;
          setLessons((prev) =>
            prev.map((l) => (l.id === lesson.id ? { ...data } : l))
          );
        } else {
          const { error } = await supabase
            .from("lessons")
            .update({
              lesson_title: lesson.lesson_title,
              lesson_content: lesson.lesson_content,
              lesson_type: lesson.lesson_type,
              order: lesson.order,
            })
            .eq("id", lesson.id);
          if (error) throw error;
        }
      }
      showToast(`${lessons.length} lessons saved!`, "success");
    } catch (err) {
      showToast(err.message || "Failed to save lessons", "error");
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
        <Link to={`/admin/courses/${courseId}/modules`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={14} /> Back to modules
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-center gap-3">
          <AlertCircle className="text-rose-600" size={20} />
          <p className="text-rose-800">{error}</p>
        </div>
      </div>
    );
  }

  // Lesson type breakdown
  const typeBreakdown = LESSON_TYPES.map((t) => ({
    ...t,
    count: lessons.filter((l) => l.lesson_type === t.value).length,
  })).filter((t) => t.count > 0);

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link
              to={`/admin/courses/${courseId}/modules`}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={14} /> Back to modules
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-500 truncate">{moduleData?.moduleTitle}</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Lesson Builder</h1>
          <p className="text-sm text-slate-500 mt-1">
            {course?.title} · {moduleData?.moduleTitle} · {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddLesson}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus size={15} /> Add Lesson
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || lessons.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{lessons.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Lessons</p>
        </div>
        {typeBreakdown.slice(0, 3).map((t) => {
          const T = t.icon;
          return (
            <div key={t.value} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl mb-1 ${t.color}`}>
                <T size={14} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{t.count}</p>
              <p className="text-xs text-slate-500">{t.label}</p>
            </div>
          );
        })}
      </div>

      {/* Lesson type legend */}
      <div className="flex flex-wrap gap-2">
        {LESSON_TYPES.map((t) => {
          const T = t.icon;
          return (
            <span key={t.value} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${t.color}`}>
              <T size={10} /> {t.label}
            </span>
          );
        })}
      </div>

      {/* Lessons list */}
      {lessons.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-2">No lessons yet</p>
          <p className="text-slate-400 text-sm mb-6">
            Add your first lesson to <strong>{moduleData?.moduleTitle}</strong>.
          </p>
          <button
            onClick={handleAddLesson}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={15} /> Add First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              total={lessons.length}
              isExpanded={expandedIndex === index}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              saving={saving}
            />
          ))}

          <button
            onClick={handleAddLesson}
            className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={15} /> Add Another Lesson
          </button>
        </div>
      )}

      {/* Sticky save */}
      {lessons.length > 0 && (
        <div className="sticky bottom-6 flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-lg"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving..." : `Save ${lessons.length} Lessons`}
          </button>
        </div>
      )}

    </div>
  );
}
