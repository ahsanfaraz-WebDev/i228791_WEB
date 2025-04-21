"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { CourseService, type Course } from "@/lib/services/course-service";
import { toast } from "@/components/ui/use-toast";
import {
  Star,
  Clock,
  Users,
  Video,
  FileText,
  Award,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Check if user is enrolled
  const checkEnrollmentStatus = async () => {
    if (!user) return;

    try {
      const enrolled = await CourseService.isEnrolled(user.id, course.id);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }
  };

  // Handle enrollment
  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?returnTo=/courses/${course.id}`);
      return;
    }

    if (isEnrolled) {
      router.push(`/dashboard/courses/${course.id}`);
      return;
    }

    try {
      setIsEnrolling(true);

      if (Number(course.price) > 0) {
        // Redirect to checkout page
        router.push(`/checkout?courseId=${course.id}`);
        return;
      }

      // Free course - enroll directly
      await CourseService.enrollStudent(user.id, course.id);

      toast({
        title: "Enrolled Successfully",
        description: `You've been enrolled in "${course.title}"`,
      });

      setIsEnrolled(true);
      router.push(`/dashboard/courses/${course.id}`);
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Enrollment Failed",
        description:
          error.message || "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                  {course.category || "Development"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                >
                  {course.level?.charAt(0).toUpperCase() +
                    course.level?.slice(1) || "Intermediate"}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>

              <p className="text-muted-foreground">{course.description}</p>

              <div className="flex items-center gap-4 flex-wrap text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>
                    {course.rating || "4.8"} ({course.reviews_count || "24"}{" "}
                    reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{course.students_count || "120"} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>{course.duration || "6 hours"} of content</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4 text-purple-500" />
                  <span>{course.videos_count || "12"} videos</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UserAvatar
                  userId={course.tutor_id || ""}
                  name={course.tutor?.full_name || "Instructor"}
                  avatarUrl={course.tutor?.avatar_url}
                  size="md"
                />
                <div>
                  <p className="font-medium">
                    {course.tutor?.full_name || "Instructor"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {course.tutor?.title || "Expert Instructor"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold">
                    {Number(course.price) > 0
                      ? `$${Number(course.price).toFixed(2)}`
                      : "Free"}
                  </p>
                  {Number(course.original_price) > 0 &&
                    Number(course.original_price) > Number(course.price) && (
                      <p className="text-lg text-muted-foreground line-through">
                        ${Number(course.original_price).toFixed(2)}
                      </p>
                    )}
                </div>

                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  {isEnrolling ? (
                    "Processing..."
                  ) : isEnrolled ? (
                    <>
                      Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : Number(course.price) > 0 ? (
                    <>
                      Purchase Course <ShoppingCart className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Enroll for Free <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  30-day money-back guarantee
                </p>

                <div className="space-y-2 mt-4">
                  <h3 className="font-semibold">This course includes:</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-emerald-500" />
                      <span>
                        {course.videos_count || "12"} videos (6 hours)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>10 resources & assignments</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
