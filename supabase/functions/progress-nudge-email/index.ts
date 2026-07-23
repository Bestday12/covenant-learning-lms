// supabase/functions/progress-nudge-email/index.ts
// Sends weekly progress nudge emails to students who haven't completed their course
// Scheduled via pg_cron to run every Monday at 8am UTC

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") ?? "";
const LMS_URL = "https://learn.covenantmarriagehelp.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ── SMTP sender ───────────────────────────────────────────────────────────────
async function sendSmtpEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  function b64(str: string): string { return base64Encode(encoder.encode(str)); }

  const boundary = `boundary_${Date.now()}`;
  const message = [
    `From: Reverend Sam Adeyemi - Covenant Marriage Help <${SMTP_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="utf-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64(`Your marriage course is waiting for you. Continue your journey at ${LMS_URL}/dashboard`),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="utf-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64(html),
    ``,
    `--${boundary}--`,
    ``,
    `.`,
  ].join("\r\n");

  try {
    const conn = await Deno.connectTls({ hostname: "smtp.hostinger.com", port: 465 });
    const read = async () => { const buf = new Uint8Array(4096); const n = await conn.read(buf); return decoder.decode(buf.subarray(0, n ?? 0)); };
    const write = async (cmd: string) => { await conn.write(encoder.encode(cmd + "\r\n")); };
    await read();
    await write(`EHLO smtp.hostinger.com`); await read();
    await write(`AUTH LOGIN`); await read();
    await write(b64(SMTP_USER)); await read();
    await write(b64(SMTP_PASS));
    const authResult = await read();
    if (!authResult.startsWith("235")) { conn.close(); return false; }
    await write(`MAIL FROM:<${SMTP_USER}>`); await read();
    await write(`RCPT TO:<${to}>`); await read();
    await write(`DATA`); await read();
    await write(message);
    const result = await read();
    await write(`QUIT`);
    conn.close();
    return result.includes("250");
  } catch (err: any) {
    console.error("SMTP error:", err.message);
    return false;
  }
}

// ── Calculate progress percentage ─────────────────────────────────────────────
function calculateProgress(progress: any, totalModules: number): number {
  if (!progress || !totalModules) return 0;
  const completed = Object.values(progress).filter((m: any) => m?.completed).length;
  return Math.round((completed / totalModules) * 100);
}

// ── Email template ─────────────────────────────────────────────────────────────
function nudgeEmailHtml(
  firstName: string,
  courseTitle: string,
  courseId: string,
  progressPct: number,
  completedModules: number,
  totalModules: number,
  nextModuleTitle: string
): string {
  const greeting = firstName ? `Dear ${firstName},` : "Dear Friend,";
  const remainingModules = totalModules - completedModules;

  // Motivational message based on progress
  let motivationalMessage = "";
  let progressEmoji = "";
  if (progressPct === 0) {
    motivationalMessage = "Your course is ready and waiting for you. Every journey begins with a single step — and your first module is ready to open right now.";
    progressEmoji = "🌱";
  } else if (progressPct < 30) {
    motivationalMessage = "You have made a start — and that matters. Couples who complete biblical marriage courses report stronger communication and deeper connection. You are on the right path.";
    progressEmoji = "🌿";
  } else if (progressPct < 60) {
    motivationalMessage = "You are making real progress. You have completed more than a third of this course — the investment you are making in your marriage is already bearing fruit. Keep going.";
    progressEmoji = "🌳";
  } else if (progressPct < 90) {
    motivationalMessage = "You are so close! More than half of this course is behind you. The most powerful modules are still ahead — do not stop now when the finish line is in sight.";
    progressEmoji = "🏃";
  } else {
    motivationalMessage = "You are almost there! Just a few modules remain between you and your certificate. This week — finish strong.";
    progressEmoji = "🏆";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3ede1;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3ede1;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#3d0a6e 0%,#5a1a9a 100%);border-radius:16px 16px 0 0;padding:36px 48px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(245,208,96,0.8);">COVENANT MARRIAGE HELP</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#ffffff;">Covenant Learning</h1>
    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">Biblical wisdom for every season of marriage</p>
  </td></tr>

  <!-- Gold bar -->
  <tr><td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:3px 0;"></td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:44px 48px;">

    <!-- Progress emoji -->
    <div style="text-align:center;margin-bottom:20px;">
      <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#c9960c,#e8b422);border-radius:50%;line-height:64px;font-size:32px;box-shadow:0 8px 24px rgba(201,150,12,0.3);">${progressEmoji}</div>
    </div>

    <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#3d0a6e;text-align:center;">
      Your marriage course is waiting for you
    </h2>
    <p style="margin:0 0 24px;font-size:13px;color:#c9960c;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:center;">
      ${courseTitle}
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:#1a0a2e;line-height:1.8;">${greeting}</p>
    <p style="margin:0 0 20px;font-size:15px;color:#1a0a2e;line-height:1.8;">${motivationalMessage}</p>

    <!-- Progress bar -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#f0eaf8;border-radius:8px;padding:20px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#3d0a6e;">Your Progress</p>
        <div style="background:#e8dff5;border-radius:50px;height:12px;overflow:hidden;margin-bottom:8px;">
          <div style="background:linear-gradient(135deg,#3d0a6e,#c9960c);height:12px;border-radius:50px;width:${progressPct}%;"></div>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#6b5f7a;">${completedModules} of ${totalModules} modules completed</td>
            <td style="font-size:15px;font-weight:700;color:#3d0a6e;text-align:right;">${progressPct}%</td>
          </tr>
        </table>
        ${remainingModules > 0 ? `<p style="margin:8px 0 0;font-size:12px;color:#9d8fb0;">${remainingModules} module${remainingModules !== 1 ? "s" : ""} remaining</p>` : ""}
      </td></tr>
    </table>

    <!-- Next module -->
    ${nextModuleTitle ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:#faf6ef;border-left:4px solid #c9960c;border-radius:0 8px 8px 0;padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#c9960c;text-transform:uppercase;letter-spacing:1px;">Continue With</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#3d0a6e;">${nextModuleTitle}</p>
      </td></tr>
    </table>
    ` : ""}

    <!-- Scripture -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:#f0eaf8;border-radius:12px;padding:20px 24px;text-align:center;">
        <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:15px;color:#3d0a6e;line-height:1.7;">"Two are better than one, because they have a good return for their labour. If either of them falls down, one can help the other up."</p>
        <p style="margin:0;font-size:11px;font-weight:700;color:#c9960c;letter-spacing:1px;text-transform:uppercase;">Ecclesiastes 4:9-10</p>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td align="center">
        <a href="${LMS_URL}/learn/${courseId}" style="display:inline-block;background:linear-gradient(135deg,#3d0a6e,#5a1a9a);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
          Continue My Course →
        </a>
      </td></tr>
    </table>

    <!-- Personal note -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:linear-gradient(135deg,#3d0a6e,#5a1a9a);border-radius:12px;padding:24px 28px;text-align:center;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,208,96,0.8);">A WORD FROM REVEREND SAM</p>
        <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:14px;color:rgba(255,255,255,0.9);line-height:1.8;">
          "I know life gets busy. But your marriage deserves this investment. Every module you complete is a seed planted in your covenant — and God is faithful to bring the harvest. I am cheering you on."
        </p>
        <p style="margin:0;font-size:13px;color:rgba(245,208,96,0.8);font-weight:600;">— Reverend Sam Adeyemi</p>
      </td></tr>
    </table>

    <p style="margin:0;font-size:15px;color:#3d0a6e;line-height:1.8;">
      With love and faith,<br/>
      <strong style="font-size:16px;">Reverend Sam Adeyemi</strong><br/>
      <span style="font-size:13px;color:#6b5f7a;">Founder, Covenant Learning<br/>Senior Pastor, Powerhouse Holyghost Ministry International</span>
    </p>

    <!-- Unsubscribe -->
    <p style="margin:24px 0 0;font-size:11px;color:#9d8fb0;text-align:center;">
      You are receiving this because you enrolled in a Covenant Learning course.<br/>
      <a href="${LMS_URL}/settings" style="color:#9d8fb0;">Manage email preferences</a>
    </p>

  </td></tr>

  <!-- Gold bar -->
  <tr><td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:2px 0;"></td></tr>

  <!-- Footer -->
  <tr><td style="background:#3d0a6e;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.5);">
      Questions? <a href="mailto:support@covenantmarriagehelp.com" style="color:#f5d060;text-decoration:none;">support@covenantmarriagehelp.com</a>
      &middot; <a href="${LMS_URL}" style="color:rgba(255,255,255,0.5);text-decoration:none;">learn.covenantmarriagehelp.com</a>
    </p>
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">&copy; 2026 Covenant Marriage Help Limited &middot; Sheffield, UK</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    console.log("Starting weekly progress nudge email job...");

    // Get all enrollments where course is not 100% complete
    // Get all enrollments
const { data: enrollments, error } = await supabase
  .from("enrollments")
  .select("user_id, course_id, enrolled_at");

if (error) throw error;

// Get all profiles
const userIds = [...new Set((enrollments || []).map((e: any) => e.user_id))];
const { data: profiles } = await supabase
  .from("profiles")
  .select("id, email, full_name")
  .in("id", userIds);

// Get all courses
const courseIds = [...new Set((enrollments || []).map((e: any) => e.course_id))];
const { data: courses } = await supabase
  .from("courses")
  .select("id, title, modules")
  .in("id", courseIds);

// Get all progress
const { data: progressRecords } = await supabase
  .from("user_progress")
  .select("user_id, course_id, progress");

// Build lookup maps
const profileMap: Record<string, any> = {};
for (const p of profiles || []) profileMap[p.id] = p;

const courseMap: Record<string, any> = {};
for (const c of courses || []) courseMap[c.id] = c;

const progressMap: Record<string, any> = {};
for (const p of progressRecords || []) {
  progressMap[`${p.user_id}_${p.course_id}`] = p.progress;
}
    if (error) throw error;

    let sent = 0;
    let skipped = 0;

    for (const enrollment of enrollments || []) {
  const profile = profileMap[enrollment.user_id];
  const course = courseMap[enrollment.course_id];
  const progressData = progressMap[`${enrollment.user_id}_${enrollment.course_id}`] || {};

      if (!profile?.email || !course) { skipped++; continue; }

      const modules = Array.isArray(course.modules) ? course.modules : [];
      const totalModules = modules.length;
      if (totalModules === 0) { skipped++; continue; }

      const completedCount = Object.values(progressData).filter((m: any) => m?.completed).length;
      const progressPct = Math.round((completedCount / totalModules) * 100);

      // Skip completed courses
      if (progressPct >= 100) { skipped++; continue; }

      // Skip if enrolled less than 3 days ago (give them time to start)
      const enrolledDaysAgo = (Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24);
      if (enrolledDaysAgo < 3) { skipped++; continue; }

      // Find next incomplete module
      const nextModule = modules.find((m: any) => !progressData[m.moduleId]?.completed);
      const nextModuleTitle = nextModule?.moduleTitle || "";

      const firstName = (profile.full_name || "").split(" ")[0] || "";

      // Build subject line based on progress
      let subject = "";
      if (progressPct === 0) {
        subject = `Your course is waiting, ${firstName} — start your first module today`;
      } else if (progressPct < 50) {
        subject = `${firstName}, you are ${progressPct}% through ${course.title} — keep going!`;
      } else {
        subject = `Almost there, ${firstName}! ${100 - progressPct}% of ${course.title} remaining`;
      }

      const html = nudgeEmailHtml(
        firstName,
        course.title,
        enrollment.course_id,
        progressPct,
        completedCount,
        totalModules,
        nextModuleTitle
      );

      const emailSent = await sendSmtpEmail({ to: profile.email, subject, html });
      if (emailSent) {
        sent++;
        console.log(`Nudge sent to ${profile.email} - ${course.title} (${progressPct}%)`);
      } else {
        skipped++;
      }

      // Small delay between emails to avoid SMTP rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`Nudge job complete: ${sent} sent, ${skipped} skipped`);

    return new Response(
      JSON.stringify({ success: true, sent, skipped }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Nudge job error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
