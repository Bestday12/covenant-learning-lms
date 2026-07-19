// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function — handles Stripe checkout.session.completed
// Deploy: supabase functions deploy stripe-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

// ── Clients (initialised once per cold start) ────────────────────────────────

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2025-02-24.acacia",
  httpClient: Stripe.createFetchHttpClient(), // required for Deno
});

// Service-role client — bypasses Row Level Security
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve Supabase user ID from the Stripe session.
 * Three strategies tried in order:
 *   A) session.metadata.user_id          — most reliable (set at checkout)
 *   B) email lookup in profiles table    — fallback for first-time buyers
 *   C) stripe_customer_id lookup         — fallback for repeat buyers
 */
async function resolveUserId(session: Stripe.Checkout.Session): Promise<string | null> {
  // Strategy A
  if (session.metadata?.user_id) {
    console.log("✅ userId from metadata:", session.metadata.user_id);
    return session.metadata.user_id;
  }

  // Strategy B
  const email =
    session.metadata?.customer_email ||
    session.customer_details?.email ||
    (session as any).customer_email;

  if (email) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!error && data) {
      console.log("✅ userId from email:", email, "→", data.id);
      return data.id;
    }
    console.warn("⚠️ No profile found for email:", email);
  }

  // Strategy C
  if (session.customer) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", session.customer)
      .maybeSingle();

    if (!error && data) {
      console.log("✅ userId from stripe_customer_id:", session.customer, "→", data.id);
      return data.id;
    }
    console.warn("⚠️ No profile found for stripe_customer_id:", session.customer);
  }

  console.error("❌ Could not resolve userId. Metadata:", JSON.stringify(session.metadata));
  return null;
}

async function enrollUserInCourse(
  userId: string,
  courseId: string,
  stripeSessionId: string
): Promise<boolean> {
  // Idempotency — skip if already enrolled
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
    console.error("❌ Supabase insert error:", error.message, error.details, error.hint);
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
    console.log(`✅ Saved stripe_customer_id for user ${userId}`);
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Stripe only sends POST; return 200 for OPTIONS (CORS preflight)
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

  // Verify Stripe signature
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
    return new Response(`Webhook signature error: ${err.message}`, { status: 400 });
  }

  console.log(`📥 Stripe event: ${event.type} | id: ${event.id}`);

  try {
    // ── checkout.session.completed ──────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        console.warn("⚠️ Payment not yet confirmed. Status:", session.payment_status);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const courseId = session.metadata?.course_id;
      if (!courseId) {
        console.error("❌ course_id missing from session metadata:", JSON.stringify(session.metadata));
        return new Response(JSON.stringify({ received: true, warning: "missing course_id" }), { status: 200 });
      }

      const userId = await resolveUserId(session);
      if (!userId) {
        console.error("❌ Could not resolve userId for session:", session.id);
        return new Response(JSON.stringify({ received: true, warning: "missing userId" }), { status: 200 });
      }

      const enrolled = await enrollUserInCourse(userId, courseId, session.id);

      if (enrolled && session.customer) {
        await saveStripeCustomerId(userId, session.customer as string);
      }
    }

    // ── async payment confirmation (bank transfers etc.) ────────────────────
    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const courseId = session.metadata?.course_id;
      const userId = await resolveUserId(session);
      if (userId && courseId) {
        await enrollUserInCourse(userId, courseId, session.id);
      }
    }
  } catch (err: any) {
    console.error("❌ Unhandled error processing event:", err.message);
    // Always return 200 — a 5xx here would cause Stripe to retry infinitely
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
