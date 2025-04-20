"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { CourseService } from "@/lib/services/course-service";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!user) {
        setError("User authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check for payment_intent and payment_intent_client_secret in URL
        const paymentIntentId = searchParams.get("payment_intent");
        
        if (!paymentIntentId) {
          // No payment intent in URL - likely a direct success from our simplified flow
          // Just redirect to dashboard
          router.push("/dashboard");
          return;
        }
        
        // Get course info from Stripe metadata
        try {
          // Get the course ID from the payment intent metadata
          const response = await fetch(`/api/verify-payment?paymentIntentId=${paymentIntentId}`);
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          if (data.courseId) {
            setCourseId(data.courseId);
            
            // Enroll the student in the course
            await CourseService.enrollInCourse(
              data.courseId,
              user.id,
              paymentIntentId
            );
            
            setIsLoading(false);
          } else {
            throw new Error("Course ID not found in payment metadata");
          }
        } catch (error: any) {
          console.error("Error processing payment success:", error);
          setError(error.message || "Failed to process enrollment");
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error("Payment success handling error:", error);
        setError(error.message || "An error occurred");
        setIsLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [router, searchParams, user]);

  const goToCourse = () => {
    if (courseId) {
      router.push(`/dashboard/courses/${courseId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded text-center">
              {error}
              <p className="mt-2 text-sm">Our team has been notified and will assist you.</p>
            </div>
          ) : (
            <p className="text-center">
              Your enrollment has been processed successfully. You can now access your course content.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {courseId ? (
            <Button onClick={goToCourse} className="bg-emerald-600 hover:bg-emerald-700">
              Go to Course
            </Button>
          ) : (
            <Button onClick={goToDashboard} className="bg-emerald-600 hover:bg-emerald-700">
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 