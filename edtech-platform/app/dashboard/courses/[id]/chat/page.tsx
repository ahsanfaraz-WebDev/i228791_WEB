"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { useAuth } from "@/components/auth/auth-provider";
import { CourseService } from "@/lib/services/course-service";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CourseChatPage({ params }: { params: { id: string } }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!user) return;

        const courseData = await CourseService.getCourseById(courseId);
        setCourse(courseData);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p>Please log in to view this course chat.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p>Loading course chat...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p>{error || "Course not found"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{course.title} - Course Chat</h1>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
      </div>

      <div className="bg-background rounded-lg shadow-md min-h-[650px]">
        <ChatInterface courseId={courseId} />
      </div>
    </div>
  );
}
