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
  CardFooter,
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
  CardElement,
} from "@stripe/react-stripe-js";
import {
  InfoIcon,
  CreditCard,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Check if Stripe publishable key is available
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Log error if key is missing
if (!publishableKey) {
  console.error(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables"
  );
}

// Test card information
const TEST_CARDS = [
  {
    number: "4242 4242 4242 4242",
    description: "Succeeds and requires no authentication",
  },
  {
    number: "4000 0027 6000 3184",
    description: "Requires authentication (3D Secure)",
  },
  {
    number: "4000 0000 0000 9995",
    description: "Declined payment (insufficient funds)",
  },
];

interface CheckoutProps {
  courseId: string;
  courseTitle: string;
  price: number;
}

export function Checkout({ courseId, courseTitle, price }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(true); // Default to test mode
  const [showAllTestCards, setShowAllTestCards] = useState(false);

  // Check if Stripe is configured
  useEffect(() => {
    if (!stripePromise) {
      setError(
        "Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables."
      );
      return;
    }

    // Create PaymentIntent as soon as the page loads
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

  const toggleShowAllTestCards = () => {
    setShowAllTestCards(!showAllTestCards);
  };

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
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : clientSecret && stripePromise ? (
          <>
            {isTestMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <InfoIcon className="h-5 w-5" />
                  <span>Test Mode</span>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  Use this test card for successful payment:
                </p>
                <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100 text-sm mb-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <code>{TEST_CARDS[0].number}</code>
                  <span className="mx-1">|</span>
                  <span>Any future date</span>
                  <span className="mx-1">|</span>
                  <span>Any 3 digits</span>
                  <span className="ml-auto">
                    <Check className="h-4 w-4 text-green-500" />
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-700 p-0 h-auto"
                  onClick={toggleShowAllTestCards}
                >
                  {showAllTestCards ? (
                    <div className="flex items-center">
                      <span>Hide additional test cards</span>
                      <ChevronUp className="ml-1 h-3 w-3" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Show additional test cards</span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </div>
                  )}
                </Button>

                {showAllTestCards && (
                  <div className="mt-2 space-y-2">
                    {TEST_CARDS.slice(1).map((card, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100 text-sm"
                      >
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <code>{card.number}</code>
                        <div className="ml-auto text-xs text-gray-500">
                          {card.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
          </>
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
      // Use confirmCardPayment instead of confirmPayment for more control
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        // Important: set to never to prevent redirect
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      // Handle successful payment right here without redirect
      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "requires_capture")
      ) {
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
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // This should be avoided with our current settings, but just in case
        console.log("Payment requires additional action");
        toast({
          title: "Additional verification required",
          description: "Your bank requires additional verification.",
        });
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
