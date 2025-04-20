import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
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

    // Get the payment intent ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if the payment was successful
    if (
      paymentIntent.status !== "succeeded" &&
      paymentIntent.status !== "requires_capture"
    ) {
      return NextResponse.json(
        { error: `Payment status is ${paymentIntent.status}, not succeeded` },
        { status: 400 }
      );
    }

    // Extract metadata
    const { courseId, courseTitle } = paymentIntent.metadata as {
      courseId?: string;
      courseTitle?: string;
    };

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID not found in payment metadata" },
        { status: 400 }
      );
    }

    // Return payment details
    return NextResponse.json({
      success: true,
      paymentIntentId,
      courseId,
      courseTitle,
      amount: paymentIntent.amount / 100, // Convert from cents to dollars
      status: paymentIntent.status,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
} 