"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
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
  Lock,
} from "lucide-react";
import { ChatInterface } from "@/components/chat-interface";
import { Checkout } from "@/components/payment/checkout-form";
import { useAuth } from "@/components/auth/auth-provider";
import {
  CourseService,
  type Course,
  type Video,
} from "@/lib/services/course-service";
import { VideoPlayer } from "@/components/video-player";
import { UserAvatar } from "@/components/user-avatar";
import { CourseHeader } from "@/components/course-header";
import { CourseTabs } from "@/components/course-tabs";
import { notFound } from "next/navigation";

// Define type for params
interface CourseParams {
  id: string;
}

export default function CoursePage() {
  // Get params using useParams hook instead
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch course data on component mount
  useEffect(() => {
    async function fetchCourseData() {
      if (!courseId) return;

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

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Course Not Found</h1>
        <p>
          The course you're looking for doesn't exist or couldn't be loaded.
        </p>
        <Button asChild className="mt-4">
          <a href="/courses">Back to Courses</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <CourseHeader course={course} />
      <CourseTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            {/* Course content will go here */}
            <p>Course content is being developed. Check back soon!</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border rounded-lg overflow-hidden">
            <h2 className="text-lg font-semibold p-4 border-b">Course Chat</h2>
            <ChatInterface courseId={courseId} />
          </div>
        </div>
      </div>
    </div>
  );
}
