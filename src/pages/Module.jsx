// src/pages/Module.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById, fetchModule } from "@/services/courseService.js";
import { useProgressStore } from "@/store/progressStore.js";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import LoadingScreen from "@/components/ui/LoadingScreen.jsx";
import Button from "@/components/ui/Button.jsx";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Users,
  PenLine,
  FileText,
  Award,
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ── Fire completion email via Edge Function ───────────────────────────────────
async function triggerCompletionEmail(userId, courseId, courseName) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/course-completion-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId, courseName }),
      }
    );
    const data = await res.json();
    console.log("✅ Completion email triggered:", data);
  } catch (err) {
    console.error("❌ Failed to trigger completion email:", err);
  }
}

// ── Tab components ────────────────────────────────────────────────────────────

function TeachingTab({ notes = [] }) {
  return (
    <div className="space-y-3">
      {notes.length === 0 && (
        <p className="text-brand-400 text-sm">No teaching notes for this module.</p>
      )}
      <ul className="space-y-3">
        {notes.map((note, i) => (
          <li key={i} className="flex gap-3 text-sm text-brand-700 leading-relaxed">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent-500" />
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScripturesTab({ scriptures = [] }) {
  return (
    <div className="space-y-3">
      {scriptures.length === 0 && (
        <p className="text-brand-400 text-sm">No scriptures for this module.</p>
      )}
      {scriptures.map((s, i) => (
        <div key={i} className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
          <p className="text-sm font-medium text-brand-800">{s}</p>
        </div>
      ))}
    </div>
  );
}

function ReflectionTab({ questions = [] }) {
  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <p className="text-brand-400 text-sm">No reflection questions for this module.</p>
      )}
      {questions.map((q, i) => (
        <div key={i} className="space-y-2">
          <p className="text-sm font-semibold text-brand-800">
            {i + 1}. {q}
          </p>
          <textarea
            rows={3}
            placeholder="Write your reflection here..."
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-700 placeholder:text-brand-300 focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 resize-none"
          />
        </div>
      ))}
    </div>
  );
}

function DiscussionTab({ questions = [] }) {
  return (
    <div className="space-y-3">
      {questions.length === 0 && (
        <p className="text-brand-400 text-sm">No discussion questions for this module.</p>
      )}
      {questions.map((q, i) => (
        <div key={i} className="flex gap-3 rounded-xl bg-accent-50 border border-accent-100 px-4 py-3">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
            {i + 1}
          </span>
          <p className="text-sm text-brand-700 leading-relaxed">{q}</p>
        </div>
      ))}
    </div>
  );
}

function ExerciseTab({ exercise = "" }) {
  return (
    <div>
      {!exercise && (
        <p className="text-brand-400 text-sm">No couple exercise for this module.</p>
      )}
      {exercise && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-5 py-4">
          <p className="text-sm text-brand-700 leading-relaxed whitespace-pre-line">{exercise}</p>
        </div>
      )}
    </div>
  );
}

function WorksheetsTab({ worksheets = [] }) {
  return (
    <div className="space-y-3">
      {worksheets.length === 0 && (
        <p className="text-brand-400 text-sm">No worksheets for this module.</p>
      )}
      {worksheets.map((ws, i) => {
        // Handle both string and object formats
        const title = typeof ws === "string" ? ws : ws.worksheetTitle || `Worksheet ${i + 1}`;
        const instructions = typeof ws === "object" ? ws.worksheetInstructions : null;
        const fields = typeof ws === "object" ? ws.worksheetFields || [] : [];

        return (
          <div key={i} className="rounded-xl border border-brand-100 bg-white px-5 py-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText size={16} className="text-accent-500 flex-shrink-0" />
              <span className="text-sm font-bold text-brand-800">{title}</span>
            </div>
            {instructions && (
              <p className="text-xs text-brand-500 mb-3 leading-relaxed">{instructions}</p>
            )}
            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field, j) => (
                  <div key={j}>
                    <p className="text-xs font-semibold text-brand-600 mb-1">
                      {typeof field === "string" ? field : field.fieldLabel || field}
                    </p>
                    <textarea
                      rows={2}
                      placeholder="Write your response here..."
                      className="w-full rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700 placeholder:text-brand-300 focus:outline-none focus:border-accent-400 resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "teaching", label: "Teaching", icon: BookOpen },
  { key: "reflection", label: "Reflection", icon: PenLine },
  { key: "discussion", label: "Discussion", icon: Users },
  { key: "exercise", label: "Exercise", icon: MessageSquare },
  { key: "worksheets", label: "Worksheets", icon: FileText },
];

export default function Module() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("teaching");
  const [completing, setCompleting] = useState(false);

  const markModuleComplete = useProgressStore((s) => s.markModuleComplete);
  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);
  const loadProgressFromBackend = useProgressStore((s) => s.loadProgressFromBackend);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId,
  });

  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ["module", courseId, moduleId],
    queryFn: () => fetchModule(courseId, moduleId),
    enabled: !!courseId && !!moduleId,
  });

  // Load progress from Supabase on mount
  useEffect(() => {
    if (user?.id && courseId) {
      loadProgressFromBackend(user.id, courseId);
    }
  }, [user?.id, courseId]);

  if (courseLoading || moduleLoading) return <LoadingScreen />;
  if (!module) return <p className="text-red-500">Module not found.</p>;

  const modules = course?.modules || [];
  const currentIndex = modules.findIndex((m) => m.moduleId === moduleId);
  const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;
  const isLastModule = currentIndex === modules.length - 1;
  const alreadyComplete = isModuleComplete(courseId, moduleId);

  const handleComplete = async () => {
    if (alreadyComplete) return;
    setCompleting(true);
    try {
      await markModuleComplete(user?.id, courseId, moduleId);
      showToast("Module completed! Well done.", "success");

      // Check if this was the last module — fire completion email
      if (isLastModule && user?.id) {
        console.log("🎉 Course complete! Firing completion email...");
        await triggerCompletionEmail(user.id, courseId, course?.title || courseId);
        showToast("🎉 Course complete! Check your email for your certificate.", "success");
        // Navigate to certificate after short delay
        setTimeout(() => {
          navigate(`/learn/${courseId}/certificate`);
        }, 2000);
      } else if (nextModule) {
        // Navigate to next module
        setTimeout(() => {
          navigate(`/learn/${courseId}/modules/${nextModule.moduleId}`);
        }, 800);
      }
    } catch (err) {
      console.error("Error completing module:", err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-brand-400">
        <Link to={`/learn/${courseId}`} className="hover:text-brand-600 transition-colors">
          {course?.title || "Course"}
        </Link>
        <ChevronRight size={14} />
        <span className="text-brand-600 font-medium">
          Module {currentIndex + 1} of {modules.length}
        </span>
        {alreadyComplete && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            <CheckCircle2 size={10} /> Completed
          </span>
        )}
      </div>

      {/* Module header */}
      <div className="mb-8">
        <p className="text-xs font-bold text-accent-500 uppercase tracking-widest mb-2">
          Module {currentIndex + 1}
          {alreadyComplete && " · Completed"}
        </p>
        <h1 className="font-serif text-2xl font-bold text-brand-800 mb-1 leading-snug">
          {module.moduleTitle}
        </h1>
        {module.moduleTheme && (
          <p className="text-brand-500 text-sm italic">{module.moduleTheme}</p>
        )}
      </div>

      {/* Welcome text */}
      {module.welcomeText && (
        <div className="mb-6 rounded-2xl bg-brand-50 border border-brand-100 px-6 py-5">
          <p className="text-brand-700 leading-relaxed text-sm">{module.welcomeText}</p>
        </div>
      )}

      {/* Memory statement */}
      {module.memoryStatement && (
        <div className="mb-6 rounded-2xl border-l-4 border-accent-400 bg-accent-50 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-1">
            Memory Statement
          </p>
          <p className="font-serif text-brand-800 font-semibold leading-relaxed">
            "{module.memoryStatement}"
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-brand-100">
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === key
                  ? "border-accent-500 text-accent-600"
                  : "border-transparent text-brand-400 hover:text-brand-600"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mb-8">
        {activeTab === "teaching" && <TeachingTab notes={module.teachingNotes} />}
        {activeTab === "reflection" && <ReflectionTab questions={module.personalReflection} />}
        {activeTab === "discussion" && <DiscussionTab questions={module.coupleDiscussion} />}
        {activeTab === "exercise" && <ExerciseTab exercise={module.coupleExercise} />}
        {activeTab === "worksheets" && <WorksheetsTab worksheets={module.worksheets} />}
      </div>

      {/* Key scriptures */}
      {module.keyScriptures?.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">Key Scriptures</p>
          <div className="flex flex-wrap gap-2">
            {module.keyScriptures.map((s, i) => (
              <span key={i} className="rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-medium text-brand-600">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weekly action step */}
      {module.weeklyActionStep && (
        <div className="mb-8 rounded-2xl bg-green-50 border border-green-100 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">
            Weekly Action Step
          </p>
          <p className="text-sm text-brand-700 leading-relaxed">{module.weeklyActionStep}</p>
        </div>
      )}

      {/* Prayer focus */}
      {module.prayerFocus && (
        <div className="mb-8 rounded-2xl bg-purple-50 border border-purple-100 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1">
            Prayer Focus
          </p>
          <p className="text-sm text-brand-700 leading-relaxed italic">{module.prayerFocus}</p>
        </div>
      )}

      {/* Navigation + complete button */}
      <div className="flex items-center justify-between pt-6 border-t border-brand-100">

        {/* Previous */}
        {prevModule ? (
          <Link
            to={`/learn/${courseId}/modules/${prevModule.moduleId}`}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <ChevronLeft size={16} /> Previous Module
          </Link>
        ) : (
          <Link
            to={`/learn/${courseId}`}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <ChevronLeft size={16} /> Back to Course
          </Link>
        )}

        {/* Complete / Next */}
        {alreadyComplete ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              <CheckCircle2 size={14} /> Completed
            </span>
            {nextModule && (
              <Link to={`/learn/${courseId}/modules/${nextModule.moduleId}`}>
                <Button size="sm">
                  Next Module <ChevronRight size={14} />
                </Button>
              </Link>
            )}
            {isLastModule && (
              <Link to={`/learn/${courseId}/certificate`}>
                <Button size="sm" variant="secondary">
                  <Award size={14} /> View Certificate
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Button
            onClick={handleComplete}
            loading={completing}
            disabled={completing}
          >
            {isLastModule ? "Complete Course 🎉" : "Mark Complete"}
            {!isLastModule && <ChevronRight size={14} />}
          </Button>
        )}
      </div>

    </div>
  );
}
