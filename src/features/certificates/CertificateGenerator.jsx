import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Button from "@/components/ui/Button.jsx";
import { Download } from "lucide-react";

export default function CertificateGenerator({ studentName, courseTitle, completionDate }) {
  const certRef = useRef(null);

  const downloadPdf = async () => {
    const el = certRef.current;
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save(`${courseTitle.replace(/\s+/g, "-")}-Certificate.pdf`);
  };

  return (
    <div className="space-y-6">
      <div
        ref={certRef}
        className="bg-white border-8 border-brand-700 rounded-lg p-16 text-center mx-auto max-w-3xl"
        style={{ aspectRatio: "1.414/1" }}
      >
        <p className="text-xs tracking-widest text-accent-600 font-semibold mb-4">
          CERTIFICATE OF COMPLETION
        </p>
        <h1 className="font-serif text-3xl font-bold text-brand-800 mb-6">
          Covenant Learning
        </h1>
        <p className="text-brand-500 mb-2">This certifies that</p>
        <p className="font-serif text-2xl font-semibold text-brand-800 mb-4 border-b-2 border-accent-500 inline-block pb-1">
          {studentName || "Student Name"}
        </p>
        <p className="text-brand-600 mb-6">
          has successfully completed the course
        </p>
        <p className="font-serif text-xl font-semibold text-brand-700 mb-8">
          {courseTitle}
        </p>
        <p className="text-sm text-brand-400">
          Completed on {completionDate || new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="text-center">
        <Button onClick={downloadPdf} variant="accent">
          <Download size={16} /> Download Certificate PDF
        </Button>
      </div>
    </div>
  );
}
