"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Play,
  Star,
  Clock,
  FileText,
  Award,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { ChatInterface } from "@/components/chat-interface";
import { Checkout } from "@/components/payment/checkout-form";
import { useAuth } from "@/components/auth/auth-provider";
import { CourseService, type Course } from "@/lib/services/course-service";

export default function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Unwrap params using React.use()
  const courseId = React.use(params).id;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await CourseService.getCourseById(courseId);
        setCourse(courseData);

        // Check if user is enrolled
        if (user) {
          const enrolled = await CourseService.isEnrolled(courseId, user.id);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  const handleEnroll = () => {
    if (!user) {
      // Redirect to login if not authenticated
      toast({
        title: "Authentication required",
        description:
          "Please log in or create an account to enroll in this course.",
      });
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    setShowCheckout(true);
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-4">Course not found</h1>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <a href="/courses">Browse Courses</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-current text-yellow-500 mr-1" />
                <span className="font-medium mr-1">4.8</span>
                <span className="text-muted-foreground">(24 reviews)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-1" />
                <span>42 students enrolled</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                <span>12 hours</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-1" />
                <span>18 videos</span>
              </div>
            </div>

            <div className="relative h-[400px] w-full rounded-lg overflow-hidden mb-6">
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Play className="h-8 w-8 ml-1" />
                </Button>
              </div>
              <Image
                src={
                  course.thumbnail_url ||
                  "/placeholder.svg?height=400&width=800"
                }
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <Tabs defaultValue="syllabus">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="syllabus" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>

              <div className="space-y-4">
                {[
                  {
                    title: "Introduction",
                    lessons: [
                      { title: "Course Overview", duration: "5:22" },
                      {
                        title: "Setting Up Your Environment",
                        duration: "12:45",
                      },
                    ],
                  },
                  {
                    title: "Advanced Component Patterns",
                    lessons: [
                      { title: "Compound Components", duration: "18:32" },
                      { title: "Render Props Pattern", duration: "22:15" },
                      { title: "Higher-Order Components", duration: "25:40" },
                    ],
                  },
                  {
                    title: "State Management",
                    lessons: [
                      { title: "Context API Deep Dive", duration: "28:17" },
                      { title: "Advanced Hooks", duration: "31:05" },
                      { title: "Custom Hooks", duration: "24:30" },
                    ],
                  },
                ].map((section, sectionIndex) => (
                  <Card key={sectionIndex}>
                    <CardContent className="p-0">
                      <div className="p-4 bg-muted font-medium">
                        {section.title}
                      </div>
                      <div>
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="p-4 border-t flex justify-between items-center"
                          >
                            <div className="flex items-center">
                              <Play className="h-4 w-4 mr-2 text-emerald-600" />
                              <span>{lesson.title}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {lesson.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden">
                      <Image
                        src={
                          course.tutor?.avatar_url ||
                          "/placeholder.svg?height=100&width=100"
                        }
                        alt={course.tutor?.full_name || "Instructor"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {course.tutor?.full_name || "Instructor"}
                        </h3>
                        <p className="text-muted-foreground">
                          Course Instructor
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="font-medium">8</p>
                          <p className="text-sm text-muted-foreground">
                            Courses
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">3,200</p>
                          <p className="text-sm text-muted-foreground">
                            Students
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">4.8</p>
                          <p className="text-sm text-muted-foreground">
                            Rating
                          </p>
                        </div>
                      </div>
                      <p>{course.tutor?.bio || "No bio available."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion">
              <Card>
                <CardContent className="p-6">
                  {isEnrolled ? (
                    <ChatInterface courseId={courseId} />
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">
                        Join the discussion
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Enroll in this course to participate in the discussion
                        forum.
                      </p>
                      <Button
                        onClick={handleEnroll}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Enroll Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          {showCheckout ? (
            <Checkout
              courseId={courseId}
              courseTitle={course.title}
              price={Number.parseFloat(course.price.toString())}
            />
          ) : (
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">
                    ${Number.parseFloat(course.price.toString()).toFixed(2)}
                  </p>
                  {isEnrolled ? (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 mb-4"
                      size="lg"
                      onClick={() =>
                        router.push(`/dashboard/courses/${courseId}`)
                      }
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 mb-4"
                      size="lg"
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    30-day money-back guarantee
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">This course includes:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                      <span>18 on-demand videos</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                      <span>12 hours of content</span>
                    </li>
                    <li className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
                      <span>Real-time chat support</span>
                    </li>
                    <li className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-emerald-600" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Course details:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <span>{course.level || "Intermediate"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last updated:
                      </span>
                      <span>
                        {new Date(course.updated_at).toLocaleDateString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Students:</span>
                      <span>42</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
