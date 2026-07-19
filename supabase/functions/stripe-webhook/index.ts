// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function — Stripe webhook + auto account creation + SMTP email
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

// ── Raw SMTP over TLS ─────────────────────────────────────────────────────────

async function sendSmtpEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function b64(str: string): string {
    return base64Encode(encoder.encode(str));
  }

  // Build RFC 2822 message
  const boundary = `boundary_${Date.now()}`;
  const date = new Date().toUTCString();
  const message = [
    `From: Covenant Marriage Help <${SMTP_USER}>`,
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
    b64(`Please view this email in an HTML-capable email client.`),
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
    // Connect via TLS to Hostinger SMTP port 465
    const conn = await Deno.connectTls({
      hostname: "smtp.hostinger.com",
      port: 465,
    });

    const read = async (): Promise<string> => {
      const buf = new Uint8Array(4096);
      const n = await conn.read(buf);
      const response = decoder.decode(buf.subarray(0, n ?? 0));
      console.log("SMTP ←", response.trim());
      return response;
    };

    const write = async (cmd: string) => {
      console.log("SMTP →", cmd.trim());
      await conn.write(encoder.encode(cmd + "\r\n"));
    };

    // SMTP handshake
    await read(); // 220 greeting

    await write(`EHLO smtp.hostinger.com`);
    await read(); // 250 capabilities

    await write(`AUTH LOGIN`);
    await read(); // 334 username prompt

    await write(b64(SMTP_USER));
    await read(); // 334 password prompt

    await write(b64(SMTP_PASS));
    const authResult = await read(); // 235 authenticated

    if (!authResult.startsWith("235")) {
      console.error("❌ SMTP AUTH failed:", authResult);
      conn.close();
      return false;
    }

    await write(`MAIL FROM:<${SMTP_USER}>`);
    await read(); // 250 OK

    await write(`RCPT TO:<${to}>`);
    await read(); // 250 OK

    await write(`DATA`);
    await read(); // 354 start input

    await write(message);
    const dataResult = await read(); // 250 OK

    await write(`QUIT`);
    conn.close();

    const success = dataResult.includes("250");
    if (success) {
      console.log(`✅ Email sent to ${to}`);
    } else {
      console.error(`❌ Email data failed:`, dataResult);
    }
    return success;

  } catch (err: any) {
    console.error("❌ SMTP connection error:", err.message);
    return false;
  }
}

// ── Email templates ───────────────────────────────────────────────────────────

function newAccountEmail(email: string, tempPassword: string, courseName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr>
    <td style="background:#1a3a5c;padding:32px 40px;text-align:center;">
      <h1 style="color:#c9a227;font-family:Georgia,serif;font-size:24px;margin:0;">Covenant Marriage Help</h1>
      <p style="color:#ffffff;margin:8px 0 0;font-size:14px;opacity:0.9;">Covenant Learning</p>
    </td>
  </tr>

  <tr>
    <td style="padding:40px;">
      <h2 style="color:#1a3a5c;font-size:20px;margin:0 0 16px;">Welcome! Your account is ready &#127881;</h2>
      <p style="color:#444;line-height:1.7;margin:0 0 16px;">
        Thank you for purchasing <strong>${courseName}</strong>. Your Covenant Learning account has been created and you are now enrolled.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4eb;border-left:4px solid #c9a227;border-radius:4px;margin:24px 0;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 8px;color:#1a3a5c;font-weight:bold;font-size:15px;">Your Login Details</p>
          <p style="margin:0 0 6px;color:#444;font-size:14px;"><strong>Website:</strong> ${LMS_URL}/login</p>
          <p style="margin:0 0 6px;color:#444;font-size:14px;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0 0 6px;color:#444;font-size:14px;"><strong>Temporary Password:</strong>
            <span style="font-family:monospace;background:#fff;padding:2px 8px;border-radius:3px;border:1px solid #ddd;">${tempPassword}</span>
          </p>
          <p style="margin:12px 0 0;color:#888;font-size:12px;">&#9888; Please change your password after your first login.</p>
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${LMS_URL}/login"
             style="display:inline-block;background:#c9a227;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-size:16px;font-weight:bold;font-family:Georgia,serif;">
            Start Your Course &#8594;
          </a>
        </td></tr>
      </table>

      <p style="color:#444;line-height:1.7;margin:0 0 16px;">
        Once logged in, you will find <strong>${courseName}</strong> ready and waiting in your dashboard.
      </p>
      <p style="color:#444;line-height:1.7;margin:0;">
        Questions? Contact us at
        <a href="mailto:support@covenantmarriagehelp.com" style="color:#1a3a5c;">support@covenantmarriagehelp.com</a>
        or call +44 7428 216189.
      </p>
    </td>
  </tr>

  <tr>
    <td style="background:#f8f8f8;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
      <p style="color:#999;font-size:12px;margin:0;">
        &copy; 2026 Covenant Marriage Help Limited &middot;
        <a href="${LMS_URL}" style="color:#1a3a5c;text-decoration:none;">learn.covenantmarriagehelp.com</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function existingUserEmail(email: string, courseName: string, courseId: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr>
    <td style="background:#1a3a5c;padding:32px 40px;text-align:center;">
      <h1 style="color:#c9a227;font-family:Georgia,serif;font-size:24px;margin:0;">Covenant Marriage Help</h1>
      <p style="color:#ffffff;margin:8px 0 0;font-size:14px;opacity:0.9;">Covenant Learning</p>
    </td>
  </tr>

  <tr>
    <td style="padding:40px;">
      <h2 style="color:#1a3a5c;font-size:20px;margin:0 0 16px;">You're enrolled! &#127891;</h2>
      <p style="color:#444;line-height:1.7;margin:0 0 16px;">
        Thank you for your purchase. You are now enrolled in <strong>${courseName}</strong> and can begin immediately.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${LMS_URL}/courses/${courseId}"
             style="display:inline-block;background:#c9a227;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-size:16px;font-weight:bold;font-family:Georgia,serif;">
            Go to Your Course &#8594;
          </a>
        </td></tr>
      </table>

      <p style="color:#444;line-height:1.7;margin:0 0 16px;">
        Log in at <a href="${LMS_URL}/login" style="color:#1a3a5c;">${LMS_URL}/login</a>
        with your existing account and your course will be waiting in your dashboard.
      </p>
      <p style="color:#444;line-height:1.7;margin:0;">
        Questions? Contact us at
        <a href="mailto:support@covenantmarriagehelp.com" style="color:#1a3a5c;">support@covenantmarriagehelp.com</a>
        or call +44 7428 216189.
      </p>
    </td>
  </tr>

  <tr>
    <td style="background:#f8f8f8;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
      <p style="color:#999;font-size:12px;margin:0;">
        &copy; 2026 Covenant Marriage Help Limited &middot;
        <a href="${LMS_URL}" style="color:#1a3a5c;text-decoration:none;">learn.covenantmarriagehelp.com</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Course name lookup ────────────────────────────────────────────────────────

const COURSE_NAMES: Record<string, string> = {
  "covenant-marriage-foundation": "The Covenant Marriage Foundation",
  "marriage-crisis-survival-guide": "Marriage Crisis Survival Guide",
  "pre-marital-masterclass": "Pre-Marital Masterclass",
  "parenting-as-a-team": "Parenting as a Team",
  "blended-family-foundations": "Blended Family Foundations",
  "communication-that-builds-marriage": "Communication That Builds Marriage",
};

// ── Generate temp password ────────────────────────────────────────────────────

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

  // Strategy A: user_id in metadata (logged-in purchase)
  if (session.metadata?.user_id) {
    console.log("✅ Existing user from metadata:", session.metadata.user_id);
    return { userId: session.metadata.user_id, isNewUser: false, email };
  }

  // Strategy B: look up by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profile) {
    console.log("✅ Existing user found by email:", email);
    return { userId: profile.id, isNewUser: false, email };
  }

  // Strategy C: look up by stripe_customer_id
  if (session.customer) {
    const { data: byCustomer } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", session.customer)
      .maybeSingle();

    if (byCustomer) {
      console.log("✅ Existing user found by stripe_customer_id");
      return { userId: byCustomer.id, isNewUser: false, email };
    }
  }

  // No user found — create one
  console.log("👤 Creating new account for:", email);
  const tempPassword = generateTempPassword();
  const fullName = session.metadata?.customer_name ||
    session.customer_details?.name || "";

  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      created_via: "stripe_purchase",
    },
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
  return { userId, isNewUser: true, email, tempPassword };
}

// ── Enroll user ───────────────────────────────────────────────────────────────

async function enrollUserInCourse(
  userId: string,
  courseId: string,
  stripeSessionId: string
): Promise<boolean> {
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
    console.error("❌ Enrollment insert error:", error.message, error.hint);
    return false;
  }

  console.log(`✅ Enrolled user=${userId} in course=${courseId}`);
  return true;
}

async function saveStripeCustomerId(userId: string, stripeCustomerId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (!profile?.stripe_customer_id) {
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", userId);
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

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

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
        console.warn("⚠️ Not yet paid, skipping. Status:", session.payment_status);
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

      const { userId, isNewUser, email, tempPassword } = userResult;

      const enrolled = await enrollUserInCourse(userId, courseId, session.id);

      if (session.customer) {
        await saveStripeCustomerId(userId, session.customer as string);
      }

      if (enrolled) {
        if (isNewUser && tempPassword) {
          await sendSmtpEmail({
            to: email,
            subject: `Welcome to Covenant Learning — Your login details inside`,
            html: newAccountEmail(email, tempPassword, courseName),
          });
        } else {
          await sendSmtpEmail({
            to: email,
            subject: `You're enrolled in ${courseName} — Start learning today`,
            html: existingUserEmail(email, courseName, courseId),
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
