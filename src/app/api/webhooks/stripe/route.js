// src/app/api/webhooks/stripe/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase.js";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

// Helper to get user ID from customer ID
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

// Helper to get course ID from session metadata
function getCourseIdFromSession(session) {
  // Check metadata for course ID
  if (session.metadata?.course_id) {
    return session.metadata.course_id;
  }

  // Fallback: check line items (if you have multiple courses)
  if (session.line_items?.data?.length > 0) {
    const firstItem = session.line_items.data[0];
    if (firstItem.metadata?.course_id) {
      return firstItem.metadata.course_id;
    }
  }

  return null;
}

// Helper to enroll user in course
async function enrollUserInCourse(userId, courseId) {
  if (!userId || !courseId) {
    console.error("❌ Missing userId or courseId");
    return false;
  }

  // Check if already enrolled
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

  // Create enrollment
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

  console.log(`✅ Enrolled user ${userId} in ${courseId}`);
  return true;
}

// === MAIN WEBHOOK HANDLER ===
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Verify webhook signature
  if (!process.env.VITE_STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.VITE_STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`📥 Received Stripe event: ${event.type}`);

  // === HANDLE CHECKOUT COMPLETED ===
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Get the user ID from the customer
    const userId = await getUserIdByCustomerId(session.customer);

    // Get the course ID from metadata
    const courseId = getCourseIdFromSession(session);

    if (userId && courseId) {
      // Enroll the user
      await enrollUserInCourse(userId, courseId);

      // Optionally: update user profile with customer ID if not set
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

      return NextResponse.json({
        received: true,
        message: `Enrolled user ${userId} in course ${courseId}`,
      });
    } else {
      console.warn("⚠️ Could not determine userId or courseId from session");
      console.log("Session metadata:", session.metadata);
      console.log("Session customer:", session.customer);
    }
  }

  // === HANDLE PAYMENT INTENT SUCCEEDED ===
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log(`💳 Payment succeeded: ${paymentIntent.id}`);

    // If you have payment_intent metadata for course enrollment
    if (paymentIntent.metadata?.course_id) {
      const courseId = paymentIntent.metadata.course_id;
      const customerId = paymentIntent.customer;

      if (customerId) {
        const userId = await getUserIdByCustomerId(customerId);
        if (userId) {
          await enrollUserInCourse(userId, courseId);
        }
      }
    }
  }

  // === HANDLE CHARGE SUCCEEDED ===
  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    console.log(`💳 Charge succeeded: ${charge.id}`);
    // Additional receipt/confirmation logic if needed
  }

  // Acknowledge receipt of the event
  return NextResponse.json({ received: true });
}

// === OPTIONS FOR CORS ===
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