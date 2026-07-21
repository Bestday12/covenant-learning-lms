// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function — Stripe webhook + auto account creation + premium email
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// ── Clients ───────────────────────────────────────────────────────────────────

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2025-02-24.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") ?? "";
const LMS_URL = "https://learn.covenantmarriagehelp.com";
const WHATSAPP_URL = "https://wa.me/447428316189?text=Hello%20Reverend%20Sam%2C%20I%20have%20just%20enrolled%20in%20a%20Covenant%20Learning%20course%20and%20would%20love%20to%20connect.";

// ── Raw SMTP over TLS ─────────────────────────────────────────────────────────

async function sendSmtpEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function b64(str: string): string {
    return base64Encode(encoder.encode(str));
  }

  const boundary = `boundary_${Date.now()}`;
  const date = new Date().toUTCString();
  const message = [
    `From: Reverend Sam Adeyemi — Covenant Marriage Help <${SMTP_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${date}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="utf-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64(`Please view this email in an HTML-capable email client. Visit ${LMS_URL}/login to access your course.`),
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

    const read = async (): Promise<string> => {
      const buf = new Uint8Array(4096);
      const n = await conn.read(buf);
      const response = decoder.decode(buf.subarray(0, n ?? 0));
      console.log("SMTP ←", response.trim());
      return response;
    };

    const write = async (cmd: string) => {
      console.log("SMTP →", cmd.startsWith(b64(SMTP_PASS)) ? "SMTP → [password hidden]" : cmd.trim());
      await conn.write(encoder.encode(cmd + "\r\n"));
    };

    await read();
    await write(`EHLO smtp.hostinger.com`);
    await read();
    await write(`AUTH LOGIN`);
    await read();
    await write(b64(SMTP_USER));
    await read();
    await write(b64(SMTP_PASS));
    const authResult = await read();

    if (!authResult.startsWith("235")) {
      console.error("❌ SMTP AUTH failed:", authResult);
      conn.close();
      return false;
    }

    await write(`MAIL FROM:<${SMTP_USER}>`);
    await read();
    await write(`RCPT TO:<${to}>`);
    await read();
    await write(`DATA`);
    await read();
    await write(message);
    const dataResult = await read();
    await write(`QUIT`);
    conn.close();

    const success = dataResult.includes("250");
    console.log(success ? `✅ Email sent to ${to}` : `❌ Email failed: ${dataResult}`);
    return success;
  } catch (err: any) {
    console.error("❌ SMTP error:", err.message);
    return false;
  }
}

// ── Email Templates ───────────────────────────────────────────────────────────

function newAccountEmail(email: string, tempPassword: string, courseName: string, firstName: string): string {
  const greeting = firstName ? `Dear ${firstName},` : "Dear Friend,";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Covenant Learning</title>
</head>
<body style="margin:0;padding:0;background-color:#f3ede1;font-family:Georgia,serif;">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3ede1;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#3d0a6e 0%,#5a1a9a 100%);border-radius:16px 16px 0 0;padding:40px 48px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(245,208,96,0.8);">COVENANT MARRIAGE HELP</p>
      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#ffffff;line-height:1.2;">Covenant Learning</h1>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);font-style:italic;">Biblical wisdom for every season of marriage</p>
      <div style="margin:24px auto 0;width:48px;height:2px;background:linear-gradient(90deg,transparent,#c9960c,transparent);"></div>
    </td>
  </tr>

  <!-- Gold accent bar -->
  <tr>
    <td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:3px 0;"></td>
  </tr>

  <!-- Main body -->
  <tr>
    <td style="background:#ffffff;padding:48px 48px 32px;">

      <!-- Welcome heading -->
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#3d0a6e;line-height:1.3;">
        Welcome to Covenant Learning &#127881;
      </h2>
      <p style="margin:0 0 28px;font-size:13px;color:#c9960c;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your journey begins today</p>

      <!-- Greeting -->
      <p style="margin:0 0 16px;font-size:16px;color:#1a0a2e;line-height:1.8;">${greeting}</p>

      <p style="margin:0 0 16px;font-size:16px;color:#1a0a2e;line-height:1.8;">
        Thank you for enrolling in <strong style="color:#3d0a6e;">${courseName}</strong>. 
        Your account has been created and you now have full access to your course.
      </p>

      <!-- Scripture -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td style="background:#faf6ef;border-left:4px solid #c9960c;border-radius:0 8px 8px 0;padding:20px 24px;">
            <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:17px;font-style:italic;color:#3d0a6e;line-height:1.6;">
              &#8220;Two are better than one, because they have a good return for their labour: If either of them falls down, one can help the other up.&#8221;
            </p>
            <p style="margin:0;font-size:12px;font-weight:700;color:#c9960c;letter-spacing:1px;text-transform:uppercase;">Ecclesiastes 4:9&#8211;10</p>
          </td>
        </tr>
      </table>

      <!-- Personal word from Rev Sam -->
      <h3 style="margin:0 0 12px;font-family:Georgia,serif;font-size:18px;color:#3d0a6e;">A Word From Reverend Sam</h3>
      <p style="margin:0 0 16px;font-size:15px;color:#3d0a6e;line-height:1.8;">
        I am genuinely honoured that you have chosen to invest in your marriage through Covenant Learning. 
        This is not just a course — it is a covenant commitment to the person God has placed beside you.
      </p>
      <p style="margin:0 0 28px;font-size:15px;color:#3d0a6e;line-height:1.8;">
        Every module has been built with prayer, Scripture, and the real stories of couples I have walked with 
        over more than a decade of ministry. My prayer is that God meets you in every lesson and brings 
        genuine, lasting transformation to your marriage.
      </p>

      <!-- Login credentials box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="background:#faf6ef;border:1px solid rgba(201,150,12,0.3);border-radius:12px;padding:28px;">
            <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;font-weight:700;color:#3d0a6e;">
              &#128274; Your Login Details
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,150,12,0.15);">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#c9960c;text-transform:uppercase;letter-spacing:1px;">Course Platform</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#3d0a6e;"><a href="${LMS_URL}/login" style="color:#5a1a9a;text-decoration:none;font-weight:600;">${LMS_URL}/login</a></p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,150,12,0.15);">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#c9960c;text-transform:uppercase;letter-spacing:1px;">Email Address</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#3d0a6e;">${email}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#c9960c;text-transform:uppercase;letter-spacing:1px;">Temporary Password</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#3d0a6e;">
                    <span style="font-family:monospace;background:#ffffff;border:1px solid rgba(201,150,12,0.4);padding:4px 12px;border-radius:6px;font-size:15px;letter-spacing:1px;">${tempPassword}</span>
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-size:12px;color:#6b5f7a;font-style:italic;">
              &#9888;&#65039; Please change your password after your first login via Settings in your dashboard.
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
        <tr>
          <td align="center">
            <a href="${LMS_URL}/login"
               style="display:inline-block;background:linear-gradient(135deg,#3d0a6e,#5a1a9a);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-family:Georgia,serif;font-size:16px;font-weight:700;letter-spacing:0.5px;">
              &#127891; Start Your Course Now
            </a>
          </td>
        </tr>
      </table>

      <!-- What to expect -->
      <h3 style="margin:0 0 16px;font-family:Georgia,serif;font-size:18px;color:#3d0a6e;">What to Expect</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3ede1;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;">
                  <div style="width:24px;height:24px;background:linear-gradient(135deg,#c9960c,#e8b422);border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#3d0a6e;">1</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#3d0a6e;">Log in and find your course</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#6b5f7a;line-height:1.6;">Your enrolled course will be waiting in your dashboard. Click to begin Module 1.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3ede1;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;">
                  <div style="width:24px;height:24px;background:linear-gradient(135deg,#c9960c,#e8b422);border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#3d0a6e;">2</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#3d0a6e;">Work through each module together</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#6b5f7a;line-height:1.6;">Each module includes teaching, reflection questions, worksheets, and prayer. Work at your own pace.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3ede1;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;">
                  <div style="width:24px;height:24px;background:linear-gradient(135deg,#c9960c,#e8b422);border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#3d0a6e;">3</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#3d0a6e;">Change your password</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#6b5f7a;line-height:1.6;">Go to Settings in your dashboard and set a personal password you will remember.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;">
                  <div style="width:24px;height:24px;background:linear-gradient(135deg,#c9960c,#e8b422);border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#3d0a6e;">4</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#3d0a6e;">Reach out if you need support</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#6b5f7a;line-height:1.6;">Reverend Sam is available via WhatsApp if you have any questions along the way.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- WhatsApp -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
        <tr>
          <td style="background:#f0fdf4;border:1px solid rgba(37,211,102,0.3);border-radius:12px;padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a0a2e;">&#128172; Connect on WhatsApp</p>
                  <p style="margin:0;font-size:13px;color:#6b5f7a;line-height:1.5;">Message Reverend Sam directly for prayer, support, or questions about your course.</p>
                </td>
                <td style="vertical-align:middle;white-space:nowrap;padding-left:16px;">
                  <a href="${WHATSAPP_URL}"
                     style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;">
                    &#128172; Chat Now
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Prayer -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="background:linear-gradient(135deg,#3d0a6e,#5a1a9a);border-radius:12px;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,208,96,0.8);">A PRAYER FOR YOU</p>
            <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:15px;font-style:italic;color:rgba(255,255,255,0.9);line-height:1.8;">
              &#8220;Lord, I pray for this couple as they begin this journey. May every lesson bring wisdom, 
              every reflection bring healing, and every prayer bring Your presence into the centre of their 
              marriage. Let what You have joined together be strengthened by Your Word and Your grace. Amen.&#8221;
            </p>
            <p style="margin:0;font-size:13px;color:rgba(245,208,96,0.8);font-weight:600;">— Reverend Sam Adeyemi</p>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:15px;color:#3d0a6e;line-height:1.8;">
        Walking with you,<br/>
        <strong style="font-size:16px;">Reverend Sam Adeyemi</strong><br/>
        <span style="font-size:13px;color:#6b5f7a;">Founder, Covenant Marriage Help &amp; Covenant Learning<br/>
        Senior Pastor, Powerhouse Holyghost Ministry International</span>
      </p>

    </td>
  </tr>

  <!-- Gold divider -->
  <tr>
    <td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:2px 0;"></td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#3d0a6e;border-radius:0 0 16px 16px;padding:28px 48px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);">
        Need help? Reply to this email or contact us at
        <a href="mailto:support@covenantmarriagehelp.com" style="color:#f5d060;text-decoration:none;">support@covenantmarriagehelp.com</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);">
        <a href="${LMS_URL}" style="color:rgba(255,255,255,0.5);text-decoration:none;">learn.covenantmarriagehelp.com</a>
        &nbsp;&middot;&nbsp;
        <a href="https://covenantmarriagehelp.com" style="color:rgba(255,255,255,0.5);text-decoration:none;">covenantmarriagehelp.com</a>
      </p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">
        &copy; 2026 Covenant Marriage Help Limited &middot; Sheffield, UK &middot; Serving couples globally
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

function existingUserEmail(email: string, courseName: string, courseId: string, firstName: string): string {
  const greeting = firstName ? `Dear ${firstName},` : "Dear Friend,";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're Enrolled — ${courseName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3ede1;font-family:Georgia,serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3ede1;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#3d0a6e 0%,#5a1a9a 100%);border-radius:16px 16px 0 0;padding:40px 48px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(245,208,96,0.8);">COVENANT MARRIAGE HELP</p>
      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#ffffff;line-height:1.2;">Covenant Learning</h1>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);font-style:italic;">Biblical wisdom for every season of marriage</p>
      <div style="margin:24px auto 0;width:48px;height:2px;background:linear-gradient(90deg,transparent,#c9960c,transparent);"></div>
    </td>
  </tr>

  <tr>
    <td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:3px 0;"></td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:#ffffff;padding:48px 48px 32px;">

      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#3d0a6e;">
        You're Enrolled! &#127891;
      </h2>
      <p style="margin:0 0 28px;font-size:13px;color:#c9960c;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your course is ready and waiting</p>

      <p style="margin:0 0 16px;font-size:16px;color:#1a0a2e;line-height:1.8;">${greeting}</p>

      <p style="margin:0 0 16px;font-size:16px;color:#1a0a2e;line-height:1.8;">
        Thank you for your investment in <strong style="color:#3d0a6e;">${courseName}</strong>. 
        You now have full access and can begin immediately.
      </p>

      <!-- Scripture -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td style="background:#faf6ef;border-left:4px solid #c9960c;border-radius:0 8px 8px 0;padding:20px 24px;">
            <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:17px;font-style:italic;color:#3d0a6e;line-height:1.6;">
              &#8220;Commit to the Lord whatever you do, and he will establish your plans.&#8221;
            </p>
            <p style="margin:0;font-size:12px;font-weight:700;color:#c9960c;letter-spacing:1px;text-transform:uppercase;">Proverbs 16:3</p>
          </td>
        </tr>
      </table>

      <!-- Personal word -->
      <p style="margin:0 0 16px;font-size:15px;color:#3d0a6e;line-height:1.8;">
        Choosing to invest in your marriage is one of the most significant decisions you can make. 
        I have put everything I know — from Scripture, from ministry, and from years of walking 
        with couples — into this course. I believe God will meet you in it.
      </p>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
        <tr>
          <td align="center">
            <a href="${LMS_URL}/learn/${courseId}"
               style="display:inline-block;background:linear-gradient(135deg,#3d0a6e,#5a1a9a);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-family:Georgia,serif;font-size:16px;font-weight:700;letter-spacing:0.5px;">
              &#9654;&#65039; Begin Your Course Now
            </a>
          </td>
        </tr>
      </table>

      <!-- WhatsApp -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
        <tr>
          <td style="background:#f0fdf4;border:1px solid rgba(37,211,102,0.3);border-radius:12px;padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a0a2e;">&#128172; Need Support?</p>
                  <p style="margin:0;font-size:13px;color:#6b5f7a;line-height:1.5;">Message Reverend Sam on WhatsApp for prayer, questions, or pastoral support.</p>
                </td>
                <td style="vertical-align:middle;white-space:nowrap;padding-left:16px;">
                  <a href="${WHATSAPP_URL}"
                     style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;">
                    &#128172; Chat
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Prayer -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="background:linear-gradient(135deg,#3d0a6e,#5a1a9a);border-radius:12px;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,208,96,0.8);">A PRAYER FOR YOUR JOURNEY</p>
            <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:15px;font-style:italic;color:rgba(255,255,255,0.9);line-height:1.8;">
              &#8220;Father, bless this couple as they commit to growing together. May every module 
              open their hearts to one another and to You. Let this course be the beginning of a 
              new and beautiful chapter in their marriage. In Jesus&#8217; name. Amen.&#8221;
            </p>
            <p style="margin:0;font-size:13px;color:rgba(245,208,96,0.8);font-weight:600;">— Reverend Sam Adeyemi</p>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:15px;color:#3d0a6e;line-height:1.8;">
        Walking with you,<br/>
        <strong style="font-size:16px;">Reverend Sam Adeyemi</strong><br/>
        <span style="font-size:13px;color:#6b5f7a;">Founder, Covenant Marriage Help &amp; Covenant Learning</span>
      </p>

    </td>
  </tr>

  <tr>
    <td style="background:linear-gradient(135deg,#c9960c,#e8b422);padding:2px 0;"></td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#3d0a6e;border-radius:0 0 16px 16px;padding:28px 48px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);">
        Need help? Contact us at
        <a href="mailto:support@covenantmarriagehelp.com" style="color:#f5d060;text-decoration:none;">support@covenantmarriagehelp.com</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);">
        <a href="${LMS_URL}" style="color:rgba(255,255,255,0.5);text-decoration:none;">learn.covenantmarriagehelp.com</a>
      </p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">
        &copy; 2026 Covenant Marriage Help Limited &middot; Sheffield, UK
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

// ── Course names ──────────────────────────────────────────────────────────────

const COURSE_NAMES: Record<string, string> = {
  "covenant-marriage-foundation": "The Covenant Marriage Foundation",
  "marriage-crisis-survival-guide": "Marriage Crisis Survival Guide",
  "pre-marital-masterclass": "Pre-Marital Masterclass",
  "parenting-as-a-team": "Parenting as a Team",
  "blended-family-foundations": "Blended Family Foundations",
  "communication-that-builds-marriage": "Communication That Builds Marriage",
  "newlywed-navigation": "The Newlywed Navigation: Building Your First Year Strong",
  "sacred-purpose-gods-design-for-marriage": "Sacred Purpose: God's Design for Your Marriage",
};

// ── Temp password ─────────────────────────────────────────────────────────────

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "Cv!";
  for (let i = 0; i < 9; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

// ── Resolve or create user ────────────────────────────────────────────────────

async function resolveOrCreateUser(session: Stripe.Checkout.Session): Promise<{
  userId: string;
  isNewUser: boolean;
  email: string;
  firstName: string;
  tempPassword?: string;
} | null> {
  const email =
    session.metadata?.customer_email ||
    session.customer_details?.email ||
    (session as any).customer_email;

  if (!email) {
    console.error("❌ No email found in session");
    return null;
  }

  const fullName = session.metadata?.customer_name || session.customer_details?.name || "";
  const firstName = fullName.split(" ")[0] || "";

  // Strategy A: user_id in metadata
  if (session.metadata?.user_id) {
    console.log("✅ Existing user from metadata:", session.metadata.user_id);
    return { userId: session.metadata.user_id, isNewUser: false, email, firstName };
  }

  // Strategy B: look up by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profile) {
    console.log("✅ Existing user found by email:", email);
    return { userId: profile.id, isNewUser: false, email, firstName };
  }

  // Strategy C: look up by stripe_customer_id
  if (session.customer) {
    const { data: byCustomer } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", session.customer)
      .maybeSingle();

    if (byCustomer) {
      return { userId: byCustomer.id, isNewUser: false, email, firstName };
    }
  }

  // Create new user
  console.log("👤 Creating new account for:", email);
  const tempPassword = generateTempPassword();

  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, created_via: "stripe_purchase" },
  });

  if (createError || !newUser?.user) {
    console.error("❌ Failed to create auth user:", createError?.message);
    return null;
  }

  const userId = newUser.user.id;

  await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: fullName,
    role: "student",
    stripe_customer_id: session.customer ?? null,
    created_at: new Date().toISOString(),
  });

  console.log("✅ Created new user:", userId);
  return { userId, isNewUser: true, email, firstName, tempPassword };
}

// ── Enroll ────────────────────────────────────────────────────────────────────

async function enrollUserInCourse(userId: string, courseId: string, stripeSessionId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    console.log(`✅ Already enrolled: user=${userId} course=${courseId}`);
    return true;
  }

  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    enrolled_at: new Date().toISOString(),
    stripe_session_id: stripeSessionId,
  });

  if (error) {
    console.error("❌ Enrollment error:", error.message, error.hint);
    return false;
  }

  console.log(`✅ Enrolled user=${userId} in course=${courseId}`);
  return true;
}

async function saveStripeCustomerId(userId: string, stripeCustomerId: string) {
  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", userId).single();
  if (!profile?.stripe_customer_id) {
    await supabase.from("profiles").update({ stripe_customer_id: stripeCustomerId }).eq("id", userId);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
      },
    });
  }

  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET not set");
    return new Response("Webhook secret missing", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err: any) {
    console.error("❌ Signature verification failed:", err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  console.log(`📥 Stripe event: ${event.type} | ${event.id}`);

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        console.warn("⚠️ Not yet paid:", session.payment_status);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const courseId = session.metadata?.course_id;
      if (!courseId) {
        console.error("❌ course_id missing from metadata:", JSON.stringify(session.metadata));
        return new Response(JSON.stringify({ received: true, warning: "missing course_id" }), { status: 200 });
      }

      const courseName = COURSE_NAMES[courseId] ?? courseId;
      const userResult = await resolveOrCreateUser(session);

      if (!userResult) {
        console.error("❌ Could not resolve or create user");
        return new Response(JSON.stringify({ received: true, warning: "user resolution failed" }), { status: 200 });
      }

      const { userId, isNewUser, email, firstName, tempPassword } = userResult;
      const enrolled = await enrollUserInCourse(userId, courseId, session.id);

      if (session.customer) await saveStripeCustomerId(userId, session.customer as string);

      if (enrolled) {
        if (isNewUser && tempPassword) {
          await sendSmtpEmail({
            to: email,
            subject: `Welcome to Covenant Learning — Your account and course are ready`,
            html: newAccountEmail(email, tempPassword, courseName, firstName),
          });
        } else {
          await sendSmtpEmail({
            to: email,
            subject: `You're enrolled in ${courseName} — Begin your journey today`,
            html: existingUserEmail(email, courseName, courseId, firstName),
          });
        }
      }
    }
  } catch (err: any) {
    console.error("❌ Unhandled error:", err.message);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
