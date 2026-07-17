import { useForm } from "react-hook-form";
import { Card, CardHeader } from "@/components/ui/Card.jsx";
import Button from "@/components/ui/Button.jsx";
import { useProgressStore } from "@/store/progressStore.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { Save, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function WorksheetForm({ courseId, moduleId, worksheet }) {
  const saveWorksheetAnswers = useProgressStore((s) => s.saveWorksheetAnswers);
  const progress = useProgressStore((s) => s.progress);
  const { showToast } = useToast();
  const [justSaved, setJustSaved] = useState(false);

  const savedAnswers =
    progress?.[courseId]?.[moduleId]?.answers?.[worksheet.worksheetTitle] || {};

  const { register, handleSubmit } = useForm({ defaultValues: savedAnswers });

  const onSubmit = (data) => {
    saveWorksheetAnswers(courseId, moduleId, worksheet.worksheetTitle, data);
    showToast("Worksheet saved", "success");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <Card>
      <CardHeader
        title={worksheet.worksheetTitle}
        subtitle={worksheet.worksheetInstructions}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {worksheet.worksheetFields.map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-brand-700 mb-1">
              {field}
            </label>
            <textarea
              {...register(`field_${i}`)}
              rows={2}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Write your response..."
            />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" size="sm">
            <Save size={14} /> Save Worksheet
          </Button>
          {justSaved && (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium animate-pulse">
              <CheckCircle size={14} /> Saved
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}