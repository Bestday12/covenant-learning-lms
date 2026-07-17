import { Link } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import ProgressBar from "@/components/ui/ProgressBar.jsx";
import Button from "@/components/ui/Button.jsx";
import { useProgressStore } from "@/store/progressStore.js";
import { BookOpen, HeartHandshake, LifeBuoy } from "lucide-react";

const THEMES = {
  "covenant-marriage-foundation": {
    gradient: "from-brand-700 to-brand-900",
    icon: BookOpen,
  },
  "marriage-crisis-survival-guide": {
    gradient: "from-red-700 to-brand-900",
    icon: LifeBuoy,
  },
  "pre-marital-masterclass": {
    gradient: "from-accent-500 to-brand-800",
    icon: HeartHandshake,
  },
};

const DEFAULT_THEME = { gradient: "from-brand-600 to-brand-800", icon: BookOpen };

export default function CourseProgressCard({ course }) {
  const getCourseProgress = useProgressStore((s) => s.getCourseProgress);
  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);
  const totalModules = course.modules?.length || 0;
  const percent = getCourseProgress(course.id, totalModules);

  const modules = course.modules || [];
  const nextIncompleteModule = modules.find(
    (m) => !isModuleComplete(course.id, m.moduleId)
  );

  const continueHref =
    percent === 0
      ? `/learn/${course.id}`
      : nextIncompleteModule
      ? `/learn/${course.id}/modules/${nextIncompleteModule.moduleId}`
      : `/learn/${course.id}`;

  const continueLabel =
    percent === 0 ? "Start Course" : percent === 100 ? "Review Course" : "Continue";

  const theme = THEMES[course.id] || DEFAULT_THEME;
  const Icon = theme.icon;

  return (
    <Card className="overflow-hidden !p-0">
      <div
        className={`h-28 bg-gradient-to-br ${theme.gradient} flex items-center justify-center relative`}
      >
        <Icon className="text-white/90" size={40} strokeWidth={1.5} />
        {percent === 100 && (
          <span className="absolute top-3 right-3 bg-white/90 text-brand-800 text-xs font-bold px-2.5 py-1 rounded-full">
            Completed
          </span>
        )}
      </div>
      <div className="p-6">
        <CardHeader title={course.title} subtitle={`${totalModules} modules`} />
        <ProgressBar value={percent} label="Progress" />
        <div className="mt-4 flex gap-2">
          <Link to={continueHref}>
            <Button size="sm">{continueLabel}</Button>
          </Link>
          {percent === 100 && (
            <Link to={`/learn/${course.id}/certificate`}>
              <Button size="sm" variant="secondary">
                View Certificate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}