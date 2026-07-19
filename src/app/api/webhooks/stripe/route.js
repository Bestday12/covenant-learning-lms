// src/app/api/webhooks/stripe/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server.js"; // ✅ FIX 1: server-side admin client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// === Helper Functions ===

/**
 * FIX 2: Try multiple strategies to resolve the Supabase user ID.
 *
 * Strategy A — metadata.user_id (most reliable: set at checkout creation time)
 * Strategy B — metadata.customer_email → look up profiles table
 * Strategy C — stripe_customer_id → look up profiles table (only works for repeat buyers)
 */
async function resolveUserId(session) {
  // Strategy A: user_id was embedded in session metadata at checkout
  if (session.metadata?.user_id) {
    console.log("✅ Resolved userId from metadata:", session.metadata.user_id);
    return session.metadata.user_id;
  }

  // Strategy B: look up by email from metadata or session customer_email
  const email = session.metadata?.customer_email || session.customer_details?.email || session.customer_email;
  if (email) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!error && data) {
      console.log("✅ Resolved userId from email:", email, "→", data.id);
      return data.id;
    }
    console.warn("⚠️ No profile found for email:", email);
  }

  // Strategy C: look up by Stripe customer ID (repeat buyers only)
  if (session.customer) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", session.customer)
      .maybeSingle();

    if (!error && data) {
      console.log("✅ Resolved userId from stripe_customer_id:", session.customer, "→", data.id);
      return data.id;
    }
    console.warn("⚠️ No profile found for stripe_customer_id:", session.customer);
  }

  console.error("❌ Could not resolve userId. Session metadata:", session.metadata);
  return null;
}

/**
 * FIX 3: Only rely on session.metadata.course_id — line_items are NOT expanded
 * in webhook payloads by default and will always be undefined without explicit expansion.
 */
function getCourseIdFromSession(session) {
  if (session.metadata?.course_id) {
    return session.metadata.course_id;
  }
  console.error("❌ course_id missing from session metadata. Full metadata:", session.metadata);
  return null;
}

async function enrollUserInCourse(userId, courseId, stripeSessionId) {
  if (!userId || !courseId) {
    console.error("❌ enrollUserInCourse: Missing userId or courseId", { userId, courseId });
    return false;
  }

  // Idempotency check — don't double-enroll
  const { data: existing } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    console.log(`✅ User ${userId} already enrolled in ${courseId} — skipping`);
    return true;
  }

  const { error } = await supabaseAdmin
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      stripe_session_id: stripeSessionId || null, // useful for audit trail
    });

  if (error) {
    console.error("❌ Supabase insert error:", error.message, error.details, error.hint);
    return false;
  }

  console.log(`✅ Enrolled user ${userId} in course ${courseId}`);
  return true;
}

async function saveStripeCustomerId(userId, stripeCustomerId) {
  if (!userId || !stripeCustomerId) return;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (!profile?.stripe_customer_id) {
    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", userId);
    console.log(`✅ Saved stripe_customer_id for user ${userId}`);
  }
}

// === MAIN WEBHOOK HANDLER ===
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  if (!supabaseAdmin) {
    console.error("❌ Supabase admin client not initialised — check env vars");
    return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`❌ Stripe signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`📥 Stripe event received: ${event.type} | id: ${event.id}`);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Only process paid sessions
      if (session.payment_status !== "paid") {
        console.warn("⚠️ Session not paid yet, skipping. Status:", session.payment_status);
        return NextResponse.json({ received: true });
      }

      const userId = await resolveUserId(session);
      const courseId = getCourseIdFromSession(session);

      if (!userId || !courseId) {
        console.error("❌ Cannot enroll — missing userId or courseId", { userId, courseId });
        // Return 200 so Stripe doesn't retry — this is a data problem, not a server problem
        return NextResponse.json({ received: true, warning: "Missing userId or courseId" });
      }

      const enrolled = await enrollUserInCourse(userId, courseId, session.id);

      if (enrolled && session.customer) {
        await saveStripeCustomerId(userId, session.customer);
      }
    }

    // Handle async payment confirmation (e.g. bank transfers)
    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const userId = await resolveUserId(session);
      const courseId = getCourseIdFromSession(session);
      if (userId && courseId) {
        await enrollUserInCourse(userId, courseId, session.id);
      }
    }

  } catch (err) {
    console.error("❌ Unhandled error processing Stripe event:", err);
    // Return 200 — returning 5xx would trigger Stripe retries
  }

  return NextResponse.json({ received: true });
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    },
  });
}
