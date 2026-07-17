import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { useProgressStore } from "@/store/progressStore.js";

export default function ModuleList({ courseId, modules }) {
  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);

  return (
    <ol className="space-y-3">
      {modules.map((mod, idx) => {
        const completed = isModuleComplete(courseId, mod.moduleId);
        const prevCompleted =
          idx === 0 || isModuleComplete(courseId, modules[idx - 1].moduleId);
        const locked = !prevCompleted && !completed;

        return (
          <li key={mod.moduleId}>
            <Link
              to={locked ? "#" : `/learn/${courseId}/modules/${mod.moduleId}`}
              onClick={(e) => locked && e.preventDefault()}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                locked
                  ? "bg-brand-50 border-brand-100 opacity-60 cursor-not-allowed"
                  : "bg-white border-brand-100 hover:border-accent-500 hover:shadow-sm"
              }`}
            >
              {completed ? (
                <CheckCircle2 className="text-green-600 shrink-0" size={22} />
              ) : locked ? (
                <Lock className="text-brand-300 shrink-0" size={20} />
              ) : (
                <Circle className="text-brand-300 shrink-0" size={20} />
              )}
              <div>
                <p className="text-xs text-brand-400 font-medium">Module {idx + 1}</p>
                <p className="font-serif font-semibold text-brand-800">{mod.moduleTitle}</p>
                <p className="text-sm text-brand-500 mt-0.5">{mod.moduleTheme}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
