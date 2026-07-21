// supabase/functions/course-completion-email/index.ts
// Deploy: supabase functions deploy course-completion-email

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
const WHATSAPP_URL = "https://wa.me/447428316189?text=Hello%20Reverend%20Sam%2C%20I%20have%20just%20completed%20a%20Covenant%20Learning%20course!";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
    b64(`Congratulations on completing your Covenant Learning course! Visit ${LMS_URL}/dashboard to view your certificate.`),
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
    const ok = result.includes("250");
    console.log(ok ? `Email sent to ${to}` : `Email failed: ${result}`);
    return ok;
  } catch (err: any) {
    console.error("SMTP error:", err.message);
    return false;
  }
}

function completionEmailHtml(firstName: string, courseName: string, courseId: string, nextCourses: any[]): string {
  const greeting = firstName ? `Dear ${firstName},` : "Dear Friend,";
  const nextCoursesHtml = nextCourses.length > 0 ? `
    <h3 style="margin:0 0 12px;font-family:Georgia,serif;font-size:17px;color:#3d0a6e;">Continue Your Journey</h3>
    <p style="margin:0 0 16px;font-size:14px;color:#6b5f7a;line-height:1.6;">Here are courses that complement what you have just completed:</p>
    ${nextCourses.map((c: any) => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
        <tr><td style="background:#faf6ef;border:1px solid rgba(201,150,12,0.2);border-radius:10px;padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#3d0a6e;">${c.title}</p>
          <p style="margin:0 0 8px;font-size:12px;color:#6b5f7a;">${c.description || ""}</p>
          <a href="${LMS_URL}/checkout/${c.id}" style="font-size:12px;font-weight:700;color:#c9960c;text-decoration:none;">Enrol Now &rarr;</a>
        </td></tr>
      </table>
    `).join("")}
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3ede1;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3ede1;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:linear-gradient(135deg,#3d0a6e 0%,#5a1a9a 100%);border-radius:16px 16px 0 0;padding:36px 48px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(245,208,96,0.8);">COVENANT MARRIAGE HELP</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#ffffff;">Covenant Learning</h1>
    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">Biblical wisdom for every season of marriage</p>
  </td></tr>
  <tr><td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:3px 0;"></td></tr>
  <tr><td style="background:#ffffff;padding:44px 48px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#c9960c,#e8b422);border-radius:50%;line-height:72px;font-size:36px;box-shadow:0 8px 24px rgba(201,150,12,0.3);">&#127942;</div>
    </div>
    <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#3d0a6e;text-align:center;">Course Completed! &#127881;</h2>
    <p style="margin:0 0 28px;font-size:13px;color:#c9960c;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:center;">Well done - you have finished the course</p>
    <p style="margin:0 0 16px;font-size:15px;color:#1a0a2e;line-height:1.8;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;color:#1a0a2e;line-height:1.8;">Congratulations on completing <strong style="color:#3d0a6e;">${courseName}</strong>. This is a significant moment - not just a course completed, but a covenant investment made in your marriage and in each other.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr><td style="background:#faf6ef;border-left:4px solid #c9960c;border-radius:0 8px 8px 0;padding:18px 22px;">
        <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:16px;color:#3d0a6e;line-height:1.6;">"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."</p>
        <p style="margin:0;font-size:11px;font-weight:700;color:#c9960c;letter-spacing:1px;text-transform:uppercase;">Galatians 6:9</p>
      </td></tr>
    </table>
    <p style="margin:0 0 16px;font-size:15px;color:#3d0a6e;line-height:1.8;">I am genuinely proud of you. Completing this course means you chose your marriage over convenience, over distraction, and over giving up. That is a covenant act - and God honours it.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr><td align="center">
        <a href="${LMS_URL}/learn/${courseId}/certificate" style="display:inline-block;background:linear-gradient(135deg,#3d0a6e,#5a1a9a);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;">&#127891; Download Your Certificate</a>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:#f0f4ff;border:1px solid rgba(61,10,110,0.1);border-radius:10px;padding:16px 20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#3d0a6e;">Share Your Achievement</p>
        <p style="margin:0 0 12px;font-size:13px;color:#6b5f7a;">Let others know you invested in your marriage. Your testimony could inspire another couple.</p>
        <a href="${WHATSAPP_URL}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:700;">Message Rev. Sam on WhatsApp</a>
      </td></tr>
    </table>
    ${nextCoursesHtml}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="background:linear-gradient(135deg,#3d0a6e,#5a1a9a);border-radius:12px;padding:24px 28px;text-align:center;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,208,96,0.8);">A PRAYER OF BLESSING</p>
        <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:14px;color:rgba(255,255,255,0.9);line-height:1.8;">"Father, I pray for this couple as they complete this journey. May every lesson they have learned take root in their hearts and bear lasting fruit in their marriage. Let Your grace sustain what Your Word has started. In Jesus' name. Amen."</p>
        <p style="margin:0;font-size:13px;color:rgba(245,208,96,0.8);font-weight:600;">- Reverend Sam Adeyemi</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:15px;color:#3d0a6e;line-height:1.8;">With gratitude and blessing,<br/><strong style="font-size:16px;">Reverend Sam Adeyemi</strong><br/><span style="font-size:13px;color:#6b5f7a;">Founder, Covenant Marriage Help and Covenant Learning<br/>Senior Pastor, Powerhouse Holyghost Ministry International</span></p>
  </td></tr>
  <tr><td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:2px 0;"></td></tr>
  <tr><td style="background:#3d0a6e;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.5);">Questions? <a href="mailto:support@covenantmarriagehelp.com" style="color:#f5d060;text-decoration:none;">support@covenantmarriagehelp.com</a> &middot; <a href="${LMS_URL}" style="color:rgba(255,255,255,0.5);text-decoration:none;">learn.covenantmarriagehelp.com</a></p>
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">&copy; 2026 Covenant Marriage Help Limited &middot; Sheffield, UK</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { userId, courseId, courseName } = await req.json();
    if (!userId || !courseId) {
      return new Response(JSON.stringify({ error: "userId and courseId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Idempotency - check if email already sent
    const { data: existing } = await supabase.from("certificates").select("id").eq("user_id", userId).eq("course_id", courseId).maybeSingle();
    if (existing) {
      console.log(`Completion email already sent for user=${userId} course=${courseId}`);
      return new Response(JSON.stringify({ success: true, alreadySent: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", userId).single();
    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const firstName = (profile.full_name || "").split(" ")[0] || "";

    // Get next course recommendations
    const { data: allCourses } = await supabase.from("courses").select("id, title, description").neq("id", courseId).limit(4);
    const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", userId);
    const enrolledIds = new Set((enrollments || []).map((e: any) => e.course_id));
    const nextCourses = (allCourses || []).filter((c: any) => !enrolledIds.has(c.id)).slice(0, 2);

    // Save certificate record
    await supabase.from("certificates").insert({ user_id: userId, course_id: courseId, issued_at: new Date().toISOString() });

    // Send email
    const emailSent = await sendSmtpEmail({
      to: profile.email,
      subject: `Congratulations! You completed ${courseName || courseId}`,
      html: completionEmailHtml(firstName, courseName || courseId, courseId, nextCourses),
    });

    return new Response(JSON.stringify({ success: true, emailSent }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
