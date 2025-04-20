import { NextResponse } from "next/server";
import Stripe from "stripe";

// Check if STRIPE_SECRET_KEY is defined
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Only initialize Stripe if the API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export async function POST(request: Request) {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    const { amount, courseId, courseTitle } = await request.json();

    // Create a PaymentIntent with the order amount and currency
    // Modified for simplified test payments
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: "usd",
      // Changed from automatic_payment_methods to allow more control
      payment_method_types: ["card"], // Only allow cards for testing simplicity
      // Add specific options for cards to minimize 3D Secure for testing
      payment_method_options: {
        card: {
          request_three_d_secure: "any", // Use 'any' to minimize 3D Secure prompts while still being valid
        },
      },
      metadata: {
        courseId,
        courseTitle,
        is_test: "true",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
