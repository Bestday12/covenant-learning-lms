import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { SALES_CONTENT } from "@/data/salesPageContent.js";

export default function ThankYou() {
  const { courseId } = useParams();
  const content = SALES_CONTENT[courseId];

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <CheckCircle2 className="text-gold-500 mx-auto mb-6" size={56} />
      <h1 className="font-serif text-3xl font-bold text-covenant-800 mb-3">
        You're in — welcome to {content?.title} {content?.titleAccent}.
      </h1>
      <p className="text-covenant-500 mb-10">
        Your next step toward a stronger, healthier, Christ-centred marriage begins now.
      </p>
      <div className="bg-covenant-50 border border-covenant-100 rounded-xl p-6 text-left mb-10">
        <p className="font-semibold text-covenant-700 mb-3">What happens next:</p>
        <ul className="space-y-2 text-sm text-covenant-600">
          <li>✓ Check your email for your course access details</li>
          <li>✓ Log in and begin with Module 1</li>
          <li>✓ Download your workbook and worksheets</li>
          <li>✓ Set aside time to go through the course prayerfully and intentionally</li>
        </ul>
      </div>
      <div className="flex gap-4 justify-center">
        <Link to="/dashboard" className="rounded-full bg-covenant-600 text-white font-bold px-6 py-3 hover:bg-covenant-700 transition-colors">
          Go to Course Dashboard
        </Link>
        <Link to={`/learn/${courseId}/modules/module-1`} className="rounded-full border border-covenant-200 text-covenant-700 font-medium px-6 py-3 hover:bg-covenant-50 transition-colors">
  Start Module 1
</Link>
      </div>
    </div>
  );
}
