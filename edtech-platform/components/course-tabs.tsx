"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  PlayCircle,
  MessageSquare,
  BookOpen,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { CourseService } from "@/lib/services/course-service";
import { CourseReviews } from "@/components/courses/course-reviews";

interface CourseTabsProps {
  courseId?: string;
}

export function CourseTabs({ courseId }: CourseTabsProps) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !courseId) return;
      
      try {
        const enrolled = await CourseService.isEnrolled(courseId, user.id);
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error("Error checking enrollment status:", error);
      }
    };
    
    checkEnrollment();
  }, [user, courseId]);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex h-auto p-1 bg-muted/50 rounded-lg">
        <TabsTrigger
          value="overview"
          className="rounded-md py-2 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          <FileText className="mr-2 h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="curriculum"
          className="rounded-md py-2 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Curriculum
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-md py-2 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          <Star className="mr-2 h-4 w-4" />
          Reviews
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="pt-6">
        <div className="space-y-6">
          {/* Overview content will be populated */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About This Course</h2>
            <p className="text-muted-foreground">
              This course is designed to provide a comprehensive understanding
              of the subject matter. Through a structured curriculum, hands-on
              projects, and interactive lessons, you'll gain practical skills
              that can be applied immediately.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Understand core principles and best practices</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Build practical projects for your portfolio</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Apply advanced techniques to real-world scenarios</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Master the latest tools and technologies</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Basic knowledge of the subject area</li>
              <li>A computer with internet access</li>
              <li>Dedication to complete the course materials</li>
            </ul>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="curriculum" className="pt-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <div className="space-y-4">
            {/* Course curriculum will be populated */}
            {[
              "Getting Started",
              "Core Concepts",
              "Advanced Techniques",
              "Final Project",
            ].map((section, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-muted/30">
                  <div className="font-medium flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {section}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {index === 0
                      ? "3 lessons"
                      : index === 1
                      ? "5 lessons"
                      : index === 2
                      ? "4 lessons"
                      : "2 lessons"}
                  </div>
                </div>
                <div className="p-4 border-t">
                  <div className="space-y-3">
                    {[
                      ...Array(
                        index === 0 ? 3 : index === 1 ? 5 : index === 2 ? 4 : 2
                      ),
                    ].map((_, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center">
                          <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
                          <span>{`Lesson ${i + 1}: ${
                            index === 0
                              ? ["Introduction", "Setting Up", "First Steps"][i]
                              : index === 1
                              ? [
                                  "Understanding Basics",
                                  "Key Principles",
                                  "Core Elements",
                                  "Framework Overview",
                                  "Implementation Strategies",
                                ][i]
                              : index === 2
                              ? [
                                  "Advanced Techniques",
                                  "Performance Optimization",
                                  "Best Practices",
                                  "Case Studies",
                                ][i]
                              : ["Project Planning", "Final Implementation"][i]
                          }`}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {`${10 + i * 5} min`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        {courseId ? (
          <CourseReviews courseId={courseId} isEnrolled={isEnrolled} />
        ) : (
          <div className="text-center py-10 border rounded-lg">
            <Star className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No reviews available</h3>
            <p className="text-muted-foreground">
              Reviews will be available once the course is loaded.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
