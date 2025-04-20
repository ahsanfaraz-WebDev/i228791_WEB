"use client";

import { useState, useEffect } from "react";
import { use } from "react";
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

export default async function CoursePage({ params }: CourseParams) {
  // Fetch course data
  const course = await CourseService.getCourseById(params.id);

  if (!course) {
    notFound();
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
            <ChatInterface courseId={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
