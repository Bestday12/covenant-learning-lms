// src/features/courses/CoursePlayer.jsx
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import WorksheetForm from "@/features/worksheets/WorksheetForm.jsx";
import { useProgressStore } from "@/store/progressStore.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { BookOpen, Heart, MessageCircle, CheckCircle, FileText } from "lucide-react";

const TABS = ["Teaching", "Reflection", "Discussion", "Exercise", "Worksheets"];

export default function CoursePlayer({ courseId, module }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const markModuleComplete = useProgressStore((s) => s.markModuleComplete);
  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);
  const { showToast } = useToast();

  const completed = isModuleComplete(courseId, module.moduleId);

  const handleComplete = () => {
    markModuleComplete(courseId, module.moduleId);
    showToast("Module marked as complete!", "success");
  };

  // Safety check: if module is missing, show fallback
  if (!module) {
    return (
      <Card>
        <p className="text-slate-500">Module content not available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="accent">{module.moduleId?.replace("module-", "Module ") || "Module"}</Badge>
          {completed && <Badge tone="success">Completed</Badge>}
        </div>
        <h1 className="font-serif text-2xl font-bold text-brand-800 mb-2">
          {module.moduleTitle || "Module"}
        </h1>
        <p className="text-brand-500 italic mb-4">{module.moduleTheme || ""}</p>
        <p className="text-brand-700 leading-relaxed">{module.welcomeText || "Welcome to this module."}</p>
        {module.memoryStatement && (
          <div className="mt-4 p-4 bg-brand-50 rounded-lg border border-brand-100">
            <p className="text-sm font-semibold text-brand-700 mb-1">Memory Statement</p>
            <p className="text-brand-800 font-serif italic">"{module.memoryStatement}"</p>
          </div>
        )}
      </Card>

      <div className="flex gap-2 border-b border-brand-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent-500 text-brand-800"
                : "border-transparent text-brand-400 hover:text-brand-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Teaching" && (
        <Card>
          <CardHeader title="Teaching Notes" />
          {module.teachingNotes && module.teachingNotes.length > 0 ? (
            <ul className="space-y-3">
              {module.teachingNotes.map((note, i) => (
                <li key={i} className="text-brand-700 text-sm leading-relaxed flex gap-2">
                  <BookOpen className="shrink-0 mt-0.5 text-accent-500" size={16} />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No teaching notes available.</p>
          )}
          {module.keyScriptures && module.keyScriptures.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {module.keyScriptures.map((verse) => (
                <Badge key={verse}>{verse}</Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "Reflection" && (
        <Card>
          <CardHeader title="Personal Reflection" />
          {module.personalReflection && module.personalReflection.length > 0 ? (
            <ol className="space-y-2 list-decimal list-inside text-brand-700 text-sm">
              {module.personalReflection.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-500">No reflection questions available.</p>
          )}
        </Card>
      )}

      {activeTab === "Discussion" && (
        <Card>
          <CardHeader title="Couple Discussion" action={<MessageCircle className="text-accent-500" size={20} />} />
          {module.coupleDiscussion && module.coupleDiscussion.length > 0 ? (
            <ul className="space-y-2 text-brand-700 text-sm">
              {module.coupleDiscussion.map((q, i) => (
                <li key={i} className="flex gap-2">
                  <Heart className="shrink-0 mt-0.5 text-accent-400" size={14} />
                  {q}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No discussion questions available.</p>
          )}
        </Card>
      )}

      {activeTab === "Exercise" && (
        <Card>
          <CardHeader title="Couple Exercise" />
          {module.coupleExercise ? (
            <>
              <p className="text-brand-700 text-sm leading-relaxed whitespace-pre-line">
                {module.coupleExercise}
              </p>
              {module.prayerFocus && (
                <div className="mt-4 p-4 bg-accent-500/5 rounded-lg border border-accent-500/20">
                  <p className="text-sm font-semibold text-brand-700 mb-1">Prayer Focus</p>
                  <p className="text-brand-700 text-sm">{module.prayerFocus}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500">No exercise available.</p>
          )}
        </Card>
      )}

      {activeTab === "Worksheets" && (
        <div className="space-y-4">
          {module.worksheets && module.worksheets.length > 0 ? (
            module.worksheets.map((ws) => (
              <WorksheetForm
                key={ws.worksheetTitle}
                courseId={courseId}
                moduleId={module.moduleId}
                worksheet={ws}
              />
            ))
          ) : (
            <Card>
              <p className="text-slate-500">No worksheets available.</p>
            </Card>
          )}
        </div>
      )}

      <Card className="bg-brand-700 text-white">
        <p className="text-sm font-medium mb-1">Weekly Action Step</p>
        <p className="text-white/90 text-sm mb-4">{module.weeklyActionStep || "Complete this module's action step."}</p>
        <Button
          variant={completed ? "secondary" : "accent"}
          onClick={handleComplete}
          disabled={completed}
          className={completed ? "!text-brand-700" : ""}
        >
          <CheckCircle size={16} />
          {completed ? "Module Completed" : "Mark Module Complete"}
        </Button>
      </Card>
    </div>
  );
}