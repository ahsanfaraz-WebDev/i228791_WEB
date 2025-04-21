"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkout } from "@/components/payment/checkout-form";
import { CourseService, type Course } from "@/lib/services/course-service";
import { useAuth } from "@/components/auth/auth-provider";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams?.get("courseId");
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchCourseData() {
      if (!courseId) {
        setError("No course selected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const courseData = await CourseService.getCourseById(courseId);

        if (!courseData) {
          setError("Course not found");
          return;
        }

        setCourse(courseData);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourseData();
  }, [courseId]);

  // Check if user is logged in
  if (!user) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="max-w-md mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Sign in to continue</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in or create an account to complete your purchase.
          </p>
          <Button asChild>
            <Link href={`/login?returnTo=/checkout?courseId=${courseId}`}>
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="max-w-md mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            {error ||
              "The course you're trying to purchase could not be found."}
          </p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-12">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to course
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="sticky top-24">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>

            <div className="border rounded-lg overflow-hidden mb-6">
              <div className="relative aspect-video">
                <Image
                  src={
                    course.thumbnail_url ||
                    "/placeholder.svg?height=200&width=380"
                  }
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex justify-between">
                  <div className="text-sm">
                    By {course.tutor?.full_name || "Instructor"}
                  </div>
                  <div className="font-medium">
                    {Number(course.price) > 0
                      ? `$${Number(course.price).toFixed(2)}`
                      : "Free"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">What you'll get:</h3>
              <ul className="text-sm space-y-2">
                <li>• Full lifetime access to all course content</li>
                <li>• All future course updates and additions</li>
                <li>• Certificate of completion</li>
                <li>• 30-day money-back guarantee</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <Checkout
            courseId={course.id}
            courseTitle={course.title}
            price={Number(course.price) || 0}
          />
        </div>
      </div>
    </div>
  );
}
