// src/pages/Module.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Award, CheckCircle2 } from "lucide-react";
import CoursePlayer from "@/features/courses/CoursePlayer.jsx";
import { fetchCourseById, fetchModule } from "@/services/courseService.js";
import { useProgressStore } from "@/store/progressStore.js";
import LoadingScreen from "@/components/ui/LoadingScreen.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";

export default function Module() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(courseId),
  });

  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ["module", courseId, moduleId],
    queryFn: () => fetchModule(courseId, moduleId),
    enabled: !!courseId && !!moduleId && !!course,
  });

  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);
  const markModuleComplete = useProgressStore((s) => s.markModuleComplete);

  const isLoading = courseLoading || moduleLoading;

  const handleMarkComplete = () => {
    markModuleComplete(courseId, moduleId);
    showToast("Module marked as complete! 🎉", "success");
  };

  // Find next module
  const currentIndex = course?.modules?.findIndex((m) => m.moduleId === moduleId) ?? -1;
  const nextModule = course?.modules?.[currentIndex + 1];
  const prevModule = course?.modules?.[currentIndex - 1];
  const isLastModule = currentIndex === (course?.modules?.length || 0) - 1;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!course || !module) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Module not found</h2>
        <Link to={`/learn/${courseId}`} className="text-accent-500 hover:underline mt-4 inline-block">
          Back to course
        </Link>
      </div>
    );
  }

  const completed = isModuleComplete(courseId, moduleId);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back button */}
      <Link
        to={`/learn/${courseId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to course
      </Link>

      {/* Module header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-slate-400">
            Module {module.moduleId?.replace("module-", "") || "1"} of {course.modules?.length || 0}
          </span>
          {completed && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={14} />
              Completed
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          {module.moduleTitle}
        </h1>
        <p className="text-slate-500 mt-1">{module.moduleTheme}</p>
      </div>

      {/* Module content */}
      <CoursePlayer courseId={courseId} module={module} />

      {/* Navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        {/* Previous button */}
        {prevModule && (
          <Link
            to={`/learn/${courseId}/modules/${prevModule.moduleId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Previous Module
          </Link>
        )}
        {!prevModule && <div />}

        {/* Complete button */}
        <button
          onClick={handleMarkComplete}
          disabled={completed}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-colors ${
            completed
              ? "bg-emerald-100 text-emerald-700 cursor-default"
              : "bg-accent-500 text-white hover:bg-accent-600"
          }`}
        >
          <CheckCircle2 size={18} />
          {completed ? "Completed" : "Mark Complete"}
        </button>

        {/* Next button */}
        {nextModule && (
          <Link
            to={`/learn/${courseId}/modules/${nextModule.moduleId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Next Module
            <ArrowRight size={16} />
          </Link>
        )}
        {isLastModule && (
          <Link
            to={`/learn/${courseId}/certificate`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors"
          >
            <Award size={16} />
            View Certificate
          </Link>
        )}
      </div>
    </div>
  );
}