"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { CourseService } from "@/lib/services/course-service";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutProps {
  courseId: string;
  courseTitle: string;
  price: number;
}

export function Checkout({ courseId, courseTitle, price }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create PaymentIntent as soon as the page loads
  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: price, courseId, courseTitle }),
    })
      .then(async (res) => {
        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        console.log("Response status:", res.status);
        console.log("Content type:", contentType);

        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON response body:", text);
          throw new Error(
            `Server returned non-JSON response (${res.status}). Check if Stripe API keys are set correctly.`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          console.error("Payment intent error:", data.error);
          throw new Error(data.error);
        }
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setError(error.message);
        toast({
          title: "Payment Initialization Failed",
          description:
            "There was an error setting up the payment: " + error.message,
          variant: "destructive",
        });
      });
  }, [price, courseId, courseTitle]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your purchase</CardTitle>
        <CardDescription>
          You're enrolling in <strong>{courseTitle}</strong> for $
          {price.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="py-4 text-center">
            <p className="text-red-500 mb-4">
              There was an error initializing the payment process. Please try
              again later.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <CheckoutForm courseId={courseId} />
          </Elements>
        ) : (
          <div className="py-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckoutForm({ courseId }: { courseId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          // Enroll the student in the course
          await CourseService.enrollInCourse(
            courseId,
            user.id,
            paymentIntent.id
          );

          toast({
            title: "Payment successful!",
            description: "You have been enrolled in the course.",
          });

          router.push(`/dashboard/courses/${courseId}`);
        } catch (enrollError: any) {
          console.error("Enrollment error:", enrollError);
          toast({
            title: "Enrollment error",
            description:
              "Payment successful but enrollment failed. Our team will resolve this issue.",
            variant: "destructive",
          });
          // Still redirect to dashboard since payment was successful
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentError(
        error.message || "Something went wrong. Please try again."
      );
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {paymentError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
          {paymentError}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {isLoading ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
}
