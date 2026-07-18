// src/app/api/create-checkout-session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

// ✅ CORRECT: Use STRIPE_SECRET_KEY (no VITE_ prefix)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia", // Updated to current version
});

// Course data (should match your courses table)
const COURSES = {
  "covenant-marriage-foundation": {
    name: "The Covenant Marriage Foundation",
    price: 9700, // £97.00 in pence
    description: "A premium 10-module Christian marriage course.",
    image: "https://covenantmarriagehelp.com/logo.png",
  },
  "marriage-crisis-survival-guide": {
    name: "Marriage Crisis Survival Guide",
    price: 14700, // £147.00 in pence
    description: "A structured restoration course for marriages in serious distress.",
    image: "https://covenantmarriagehelp.com/logo.png",
  },
  "pre-marital-masterclass": {
    name: "Pre-Marital Masterclass",
    price: 14700,
    description: "A discernment and preparation course for engaged couples.",
    image: "https://covenantmarriagehelp.com/logo.png",
  },
  "parenting-as-a-team": {
    name: "Parenting as a Team",
    price: 9700,
    description: "A Christ-centred parenting unity course for couples.",
    image: "https://covenantmarriagehelp.com/logo.png",
  },
  "blended-family-foundations": {
    name: "Blended Family Foundations",
    price: 9700,
    description: "Building a new family with wisdom, patience, and grace.",
    image: "https://covenantmarriagehelp.com/logo.png",
  },
  "communication-that-builds-marriage": {
    name: "Communication That Builds Marriage",
    price: 9700,
    description: "Transform your communication and strengthen your marriage.",
    image: "https://covenantmarriagehelp.com/logo.png",
  },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { courseId, userId, email, successUrl, cancelUrl } = body;

    // Validate course exists
    const course = COURSES[courseId];
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: "User must be logged in to purchase" },
        { status: 401 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: course.name,
              description: course.description,
              images: course.image ? [course.image] : undefined,
              metadata: {
                course_id: courseId,
              },
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`,
      metadata: {
        course_id: courseId,
        user_id: userId,
      },
      customer_email: email,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "NG"],
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}