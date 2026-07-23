// src/features/admin/certificates/pages/AdminCertificateBuilder.jsx
import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { useToast } from "@/components/ui/ToastProvider.jsx";

// ── Default certificate settings ─────────────────────────────────────────────
const DEFAULTS = {
  // Colours
  primaryColor: "#3d0a6e",
  secondaryColor: "#5a1a9a",
  accentColor: "#c9960c",
  accentLight: "#e8b422",
  textDark: "#1a0a2e",
  textMid: "#6b5f7a",
  bgColor: "#ffffff",

  // Corner triangles
  cornerStyle: "triangle", // triangle | none
  cornerSize: 72,

  // Border
  outerBorderColor: "#3d0a6e",
  innerBorderColor: "#c9960c",
  showInnerBorder: true,

  // Institution
  institutionName: "Covenant Learning",
  institutionTagline: "Biblical wisdom for every season of marriage",

  // Certificate title
  certificateTitle: "Certificate of Completion",
  certifyText: "This is to certify that",
  completionText: "has successfully completed",

  // Instructor
  instructorName: "Reverend Sam Adeyemi",
  instructorTitle: "Course Instructor",

  // Scripture
  showScripture: true,
  scriptureText: "Two are better than one, because they have a good return for their labour.",
  scriptureRef: "Ecclesiastes 4:9",

  // Logo
  showLogo: true,

  // Font
  headingFont: "Georgia, serif",
  bodyFont: "Arial, sans-serif",

  // Watermark
  showWatermark: true,
  watermarkText: "CMH",
};

const FONT_OPTIONS = [
  { label: "Georgia (Classic)", value: "Georgia, serif" },
  { label: "Times New Roman (Formal)", value: "'Times New Roman', serif" },
  { label: "Palatino (Elegant)", value: "Palatino, serif" },
  { label: "Garamond (Traditional)", value: "Garamond, serif" },
  { label: "Arial (Clean)", value: "Arial, sans-serif" },
  { label: "Trebuchet (Modern)", value: "'Trebuchet MS', sans-serif" },
];

const CORNER_STYLES = [
  { label: "Triangle corners", value: "triangle" },
  { label: "No corners", value: "none" },
];

// ── Certificate Preview ───────────────────────────────────────────────────────
function CertificatePreview({ settings, studentName = "Student Name", courseName = "Course Title" }) {
  const s = settings;

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1.414 / 1",
        background: s.bgColor,
        position: "relative",
        overflow: "hidden",
        fontFamily: s.bodyFont,
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
      }}
    >
      {/* Corner triangles */}
      {s.cornerStyle === "triangle" && (
        <>
          {[
            { top: 0, left: 0, clip: "polygon(0 0, 100% 0, 0 100%)", gradient: "135deg" },
            { top: 0, right: 0, clip: "polygon(0 0, 100% 0, 100% 100%)", gradient: "225deg" },
            { bottom: 0, left: 0, clip: "polygon(0 0, 0 100%, 100% 100%)", gradient: "45deg" },
            { bottom: 0, right: 0, clip: "polygon(100% 0, 0 100%, 100% 100%)", gradient: "315deg" },
          ].map((c, i) => (
            <div key={i} style={{
              position: "absolute",
              width: s.cornerSize, height: s.cornerSize,
              top: c.top, left: c.left, right: c.right, bottom: c.bottom,
              background: `linear-gradient(${c.gradient}, ${s.primaryColor} 0%, ${s.secondaryColor} 100%)`,
              clipPath: c.clip,
            }} />
          ))}
        </>
      )}

      {/* Outer border */}
      <div style={{ position: "absolute", inset: 14, border: `2px solid ${s.outerBorderColor}`, borderRadius: 3 }} />

      {/* Inner border */}
      {s.showInnerBorder && (
        <div style={{ position: "absolute", inset: 22, border: `1px solid ${s.accentColor}`, borderRadius: 2, opacity: 0.55 }} />
      )}

      {/* Gold top rule */}
      <div style={{ position: "absolute", top: 34, left: 56, right: 56, height: 1, background: `linear-gradient(90deg,transparent,${s.accentColor},transparent)` }} />
      <div style={{ position: "absolute", bottom: 34, left: 56, right: 56, height: 1, background: `linear-gradient(90deg,transparent,${s.accentColor},transparent)` }} />

      {/* Watermark */}
      {s.showWatermark && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
          <p style={{ fontSize: 120, fontWeight: 900, color: s.primaryColor, opacity: 0.018, fontFamily: s.headingFont, userSelect: "none" }}>
            {s.watermarkText}
          </p>
        </div>
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "48px 72px", textAlign: "center" }}>

        {/* Logo */}
        {s.showLogo && (
          <img src="/logo.png" alt="Logo" style={{ height: 36, width: "auto", objectFit: "contain", marginBottom: 6 }} onError={(e) => e.target.style.display = "none"} />
        )}

        {/* Institution */}
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: s.accentColor, marginBottom: 5, fontFamily: s.bodyFont }}>
          {s.institutionName}
        </p>

        {/* Decorative dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 32, height: 1, background: s.accentColor, opacity: 0.5 }} />
          <div style={{ width: 4, height: 4, background: s.accentColor, borderRadius: "50%" }} />
          <div style={{ width: 4, height: 4, background: s.primaryColor, borderRadius: "50%" }} />
          <div style={{ width: 4, height: 4, background: s.accentColor, borderRadius: "50%" }} />
          <div style={{ width: 32, height: 1, background: s.accentColor, opacity: 0.5 }} />
        </div>

        {/* Certificate title */}
        <h1 style={{ fontSize: "clamp(20px, 3.5vw, 36px)", fontWeight: 700, color: s.primaryColor, marginBottom: 12, lineHeight: 1.15, fontFamily: s.headingFont }}>
          {s.certificateTitle}
        </h1>

        {/* Certify text */}
        <p style={{ fontSize: 11, color: s.textMid, marginBottom: 8, fontFamily: s.bodyFont, letterSpacing: "0.04em" }}>
          {s.certifyText}
        </p>

        {/* Student name */}
        <div style={{ marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${s.primaryColor}`, display: "inline-block", minWidth: 220 }}>
          <p style={{ fontSize: "clamp(16px, 2.5vw, 26px)", fontWeight: 700, color: s.textDark, fontFamily: s.headingFont }}>
            {studentName}
          </p>
        </div>

        {/* Completion text */}
        <p style={{ fontSize: 11, color: s.textMid, marginBottom: 6, fontFamily: s.bodyFont, letterSpacing: "0.04em" }}>
          {s.completionText}
        </p>

        {/* Course name */}
        <p style={{ fontSize: "clamp(12px, 1.8vw, 18px)", fontWeight: 700, color: s.accentColor, marginBottom: 5, fontFamily: s.headingFont }}>
          {courseName}
        </p>

        {/* Scripture */}
        {s.showScripture && (
          <p style={{ fontSize: 9, color: s.primaryColor, opacity: 0.65, marginBottom: 16, fontFamily: s.bodyFont, letterSpacing: "0.03em", maxWidth: 400 }}>
            "{s.scriptureText}" — {s.scriptureRef}
          </p>
        )}

        {/* Signatures */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 40, width: "100%", maxWidth: 520 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: `1px solid ${s.primaryColor}`, paddingTop: 6, minWidth: 100 }}>
              <p style={{ fontSize: 10, color: s.primaryColor, fontWeight: 700, fontFamily: s.bodyFont, letterSpacing: "0.05em" }}>
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p style={{ fontSize: 8, color: s.textMid, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: s.bodyFont }}>
                Date of Completion
              </p>
            </div>
          </div>
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${s.accentColor}, ${s.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 3px", boxShadow: `0 3px 10px rgba(201,150,12,0.3)` }}>
              <span style={{ fontSize: 18 }}>🏆</span>
            </div>
            <p style={{ fontSize: 7, color: s.accentColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", fontFamily: s.bodyFont }}>Verified</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: `1px solid ${s.primaryColor}`, paddingTop: 6, minWidth: 160 }}>
              <p style={{ fontSize: 10, color: s.primaryColor, fontFamily: s.bodyFont, letterSpacing: "0.03em", fontWeight: 600 }}>
                {s.instructorName}
              </p>
              <p style={{ fontSize: 8, color: s.textMid, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: s.bodyFont }}>
                {s.instructorTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Field components ──────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50"
    />
  );
}

function ColorInput({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-400 focus:outline-none"
        placeholder="#000000"
      />
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-slate-600">{label}</span>
    </label>
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-indigo-400 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">{title}</h3>
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminCertificateBuilder() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Load saved settings from Supabase settings table
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "certificate_settings")
          .maybeSingle();

        if (data?.value) {
          setSettings({ ...DEFAULTS, ...data.value });
        }
      } catch (err) {
        console.error("Failed to load certificate settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "certificate_settings", value: settings }, { onConflict: "key" });

      if (error) throw error;
      setSaved(true);
      showToast("Certificate settings saved!", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Reset all certificate settings to defaults?")) return;
    setSettings(DEFAULTS);
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Certificate Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Customise the design of all Covenant Learning certificates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={15} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Save size={15} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "xl:grid-cols-[400px_1fr]" : "xl:grid-cols-1"}`}>

        {/* Settings panel */}
        <div className="space-y-4 order-2 xl:order-1">

          {/* Colours */}
          <Section title="🎨 Colours">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary Colour">
                <ColorInput value={settings.primaryColor} onChange={(v) => update("primaryColor", v)} />
              </Field>
              <Field label="Secondary Colour">
                <ColorInput value={settings.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
              </Field>
              <Field label="Accent / Gold">
                <ColorInput value={settings.accentColor} onChange={(v) => update("accentColor", v)} />
              </Field>
              <Field label="Background">
                <ColorInput value={settings.bgColor} onChange={(v) => update("bgColor", v)} />
              </Field>
            </div>
          </Section>

          {/* Border & Corners */}
          <Section title="🖼 Border & Corners">
            <Field label="Corner Style">
              <SelectInput value={settings.cornerStyle} onChange={(v) => update("cornerStyle", v)} options={CORNER_STYLES} />
            </Field>
            {settings.cornerStyle === "triangle" && (
              <Field label="Corner Size (px)">
                <input
                  type="range" min="40" max="120" value={settings.cornerSize}
                  onChange={(e) => update("cornerSize", parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-1">{settings.cornerSize}px</p>
              </Field>
            )}
            <Field label="Outer Border Colour">
              <ColorInput value={settings.outerBorderColor} onChange={(v) => update("outerBorderColor", v)} />
            </Field>
            <Toggle value={settings.showInnerBorder} onChange={(v) => update("showInnerBorder", v)} label="Show inner gold border" />
            {settings.showInnerBorder && (
              <Field label="Inner Border Colour">
                <ColorInput value={settings.innerBorderColor} onChange={(v) => update("innerBorderColor", v)} />
              </Field>
            )}
          </Section>

          {/* Institution */}
          <Section title="🏛 Institution">
            <Toggle value={settings.showLogo} onChange={(v) => update("showLogo", v)} label="Show logo" />
            <Field label="Institution Name">
              <TextInput value={settings.institutionName} onChange={(v) => update("institutionName", v)} placeholder="Covenant Learning" />
            </Field>
            <Field label="Tagline">
              <TextInput value={settings.institutionTagline} onChange={(v) => update("institutionTagline", v)} placeholder="Biblical wisdom..." />
            </Field>
          </Section>

          {/* Certificate Text */}
          <Section title="📜 Certificate Text">
            <Field label="Certificate Title">
              <TextInput value={settings.certificateTitle} onChange={(v) => update("certificateTitle", v)} placeholder="Certificate of Completion" />
            </Field>
            <Field label="Certify Text">
              <TextInput value={settings.certifyText} onChange={(v) => update("certifyText", v)} placeholder="This is to certify that" />
            </Field>
            <Field label="Completion Text">
              <TextInput value={settings.completionText} onChange={(v) => update("completionText", v)} placeholder="has successfully completed" />
            </Field>
          </Section>

          {/* Instructor */}
          <Section title="✍️ Instructor Signature">
            <Field label="Instructor Name">
              <TextInput value={settings.instructorName} onChange={(v) => update("instructorName", v)} placeholder="Reverend Sam Adeyemi" />
            </Field>
            <Field label="Instructor Title">
              <TextInput value={settings.instructorTitle} onChange={(v) => update("instructorTitle", v)} placeholder="Course Instructor" />
            </Field>
          </Section>

          {/* Scripture */}
          <Section title="📖 Scripture Quote">
            <Toggle value={settings.showScripture} onChange={(v) => update("showScripture", v)} label="Show scripture quote" />
            {settings.showScripture && (
              <>
                <Field label="Scripture Text">
                  <textarea
                    value={settings.scriptureText}
                    onChange={(e) => update("scriptureText", e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none resize-none"
                    placeholder="Two are better than one..."
                  />
                </Field>
                <Field label="Scripture Reference">
                  <TextInput value={settings.scriptureRef} onChange={(v) => update("scriptureRef", v)} placeholder="Ecclesiastes 4:9" />
                </Field>
              </>
            )}
          </Section>

          {/* Fonts */}
          <Section title="✒️ Typography">
            <Field label="Heading Font" hint="Used for certificate title and student name">
              <SelectInput value={settings.headingFont} onChange={(v) => update("headingFont", v)} options={FONT_OPTIONS} />
            </Field>
            <Field label="Body Font" hint="Used for labels and smaller text">
              <SelectInput value={settings.bodyFont} onChange={(v) => update("bodyFont", v)} options={FONT_OPTIONS} />
            </Field>
          </Section>

          {/* Watermark */}
          <Section title="💧 Watermark">
            <Toggle value={settings.showWatermark} onChange={(v) => update("showWatermark", v)} label="Show background watermark" />
            {settings.showWatermark && (
              <Field label="Watermark Text">
                <TextInput value={settings.watermarkText} onChange={(v) => update("watermarkText", v)} placeholder="CMH" />
              </Field>
            )}
          </Section>

        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="order-1 xl:order-2">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800">Live Preview</h3>
                  <span className="text-xs text-slate-400">Updates as you edit</span>
                </div>
                <CertificatePreview
                  settings={settings}
                  studentName="Reverend Sam Adeyemi"
                  courseName="The Covenant Marriage Foundation"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
