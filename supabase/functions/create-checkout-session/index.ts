// supabase/functions/create-checkout-session/index.ts
// Deploy: supabase functions deploy create-checkout-session
// Called from frontend: fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, ...)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2025-02-24.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const COURSES: Record<string, { name: string; price: number; description: string }> = {
  "covenant-marriage-foundation": {
    name: "The Covenant Marriage Foundation",
    price: 9700,
    description: "A premium 10-module Christian marriage course.",
  },
  "marriage-crisis-survival-guide": {
    name: "Marriage Crisis Survival Guide",
    price: 14700,
    description: "A structured restoration course for marriages in serious distress.",
  },
  "pre-marital-masterclass": {
    name: "Pre-Marital Masterclass",
    price: 14700,
    description: "A discernment and preparation course for engaged couples.",
  },
  "parenting-as-a-team": {
    name: "Parenting as a Team",
    price: 9700,
    description: "A Christ-centred parenting unity course for couples.",
  },
  "blended-family-foundations": {
    name: "Blended Family Foundations",
    price: 9700,
    description: "Building a new family with wisdom, patience, and grace.",
  },
  "communication-that-builds-marriage": {
    name: "Communication That Builds Marriage",
    price: 7500,
    description: "Transform your communication and strengthen your marriage.",
  },
  "test-course": {
  name: "Test Course",
  price: 100, // £1.00 in pence
  description: "A £1 test course for development purposes.",
},
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { courseId, userId, email, fullName, successUrl, cancelUrl } = await req.json();

    const course = COURSES[courseId];
    if (!course) {
      return new Response(
        JSON.stringify({ error: "Course not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "User must be logged in" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LMS_URL = "https://learn.covenantmarriagehelp.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: course.name,
              description: course.description,
              images: ["https://covenantmarriagehelp.com/logo.png"],
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${LMS_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${LMS_URL}/courses/${courseId}`,

      // ✅ Critical — these are what the webhook reads to enroll the user
      metadata: {
        course_id: courseId,
        user_id: userId,
        customer_email: email,
        customer_name: fullName || "",
      },

      customer_email: email,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "NG"],
      },
    });

    console.log(`✅ Created checkout session ${session.id} for course=${courseId} user=${userId}`);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("❌ Error creating checkout session:", err.message);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
