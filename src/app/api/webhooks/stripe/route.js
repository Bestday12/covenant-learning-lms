// src/app/api/webhooks/stripe/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// === Helper Functions ===
async function getUserIdByCustomerId(customerId) {
  if (!customerId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  if (error || !data) {
    console.error("❌ User not found for customer:", customerId);
    return null;
  }
  return data.id;
}

function getCourseIdFromSession(session) {
  if (session.metadata?.course_id) return session.metadata.course_id;
  if (session.line_items?.data?.length > 0) {
    const firstItem = session.line_items.data[0];
    if (firstItem.metadata?.course_id) return firstItem.metadata.course_id;
  }
  return null;
}

async function enrollUserInCourse(userId, courseId) {
  if (!userId || !courseId) {
    console.error("❌ Missing userId or courseId");
    return false;
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    console.log(`✅ User ${userId} already enrolled in ${courseId}`);
    return true;
  }

  const { error } = await supabase
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
    });

  if (error) {
    console.error("❌ Error enrolling user:", error);
    return false;
  }

  console.log(`✅ Enrolled user ${userId} in course ${courseId}`);
  return true;
}

// === MAIN WEBHOOK HANDLER ===
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`❌ Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`📥 Received Stripe event: ${event.type}`);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = await getUserIdByCustomerId(session.customer);
      const courseId = getCourseIdFromSession(session);

      if (userId && courseId) {
        await enrollUserInCourse(userId, courseId);

        // Optional: update profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", userId)
          .single();

        if (!profile?.stripe_customer_id && session.customer) {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: session.customer })
            .eq("id", userId);
        }
      } else {
        console.warn("⚠️ Could not determine userId or courseId", { userId, courseId });
      }
    }

    // You can add payment_intent.succeeded etc. here if needed
  } catch (err) {
    console.error("Error processing event:", err);
    // We still return 200 so Stripe doesn't retry
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