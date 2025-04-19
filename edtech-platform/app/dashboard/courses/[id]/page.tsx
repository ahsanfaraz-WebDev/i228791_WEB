"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/video-player";
import { ChatInterface } from "@/components/chat-interface";
import { Play, Users, MessageSquare, FileText, Edit } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  CourseService,
  type Course,
  type Video,
} from "@/lib/services/course-service";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function CourseDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  // Unwrap params using React.use()
  const courseId = React.use(params).id;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch user profile to get role
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
        }

        // Fetch course details
        const courseData = await CourseService.getCourseById(courseId);
        setCourse(courseData);

        // Fetch course videos
        const videosData = await CourseService.getCourseVideos(courseId);
        setVideos(videosData);

        // If tutor, fetch enrolled students
        if (profile?.role === "tutor") {
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select(
              `
              *,
              student:profiles(id, full_name, avatar_url)
            `
            )
            .eq("course_id", courseId);

          // Get progress for each student
          const studentsWithProgress = await Promise.all(
            (enrollments || []).map(async (enrollment) => {
              // Mock progress for now
              const progress = Math.floor(Math.random() * 100);

              return {
                id: enrollment.student.id,
                name: enrollment.student.full_name,
                avatar: enrollment.student.avatar_url,
                progress,
                lastActive: getRandomLastActive(),
              };
            })
          );

          setStudents(studentsWithProgress);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast({
          title: "Error",
          description: "Failed to load course data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, courseId]);

  const activeVideo = videos[activeVideoIndex] || null;

  const handleVideoProgress = async (currentTime: number, duration: number) => {
    // In a real app, you would save progress to the database
    console.log(`Progress: ${currentTime}/${duration}`);
  };

  const handleVideoComplete = async () => {
    // In a real app, you would mark the video as completed
    toast({
      title: "Video completed!",
      description: "Your progress has been saved.",
    });
  };

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Course Dashboard</h1>
        <p>Please log in to view this course.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Course Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Course Not Found</h1>
        <p>
          The course you're looking for doesn't exist or you don't have access
          to it.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {userRole === "tutor" && (
          <Button asChild variant="outline">
            <Link href={`/dashboard/courses/${course.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              {activeVideo ? (
                <VideoPlayer
                  videoUrl={
                    activeVideo.video_url ||
                    "/placeholder.svg?height=400&width=800"
                  }
                  thumbnailUrl={
                    activeVideo.thumbnail_url ||
                    "/placeholder.svg?height=200&width=350"
                  }
                  title={activeVideo.title}
                  transcript={activeVideo.transcript?.content}
                  onProgress={handleVideoProgress}
                  onComplete={handleVideoComplete}
                />
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No video selected</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="transcript">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {activeVideo?.title || "No video selected"}
                  </CardTitle>
                  <CardDescription>AI-generated transcript</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeVideo?.transcript ? (
                    <p className="whitespace-pre-line">
                      {activeVideo.transcript.content}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      No transcript available for this video.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion">
              <Card>
                <CardContent className="p-6">
                  <ChatInterface courseId={course.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Course Content
              </CardTitle>
              {userRole === "student" && (
                <CardDescription>
                  Your progress: {Math.floor(Math.random() * 100)}%
                  <Progress
                    value={Math.floor(Math.random() * 100)}
                    className="mt-2"
                  />
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {videos.length > 0 ? (
                  videos.map((video, index) => (
                    <button
                      key={video.id}
                      className={`w-full text-left p-4 flex items-start gap-3 hover:bg-muted transition-colors ${
                        index === activeVideoIndex ? "bg-muted" : ""
                      }`}
                      onClick={() => setActiveVideoIndex(index)}
                    >
                      <div className="relative h-16 w-24 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            video.thumbnail_url ||
                            "/placeholder.svg?height=120&width=200"
                          }
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(video.duration)}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No videos available for this course.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {userRole === "tutor" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Enrolled Students
                </CardTitle>
                <CardDescription>
                  {students.length} students enrolled
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className="p-4 flex items-center gap-3"
                      >
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          <Image
                            src={
                              student.avatar ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={student.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              Progress: {student.progress}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last active: {student.lastActive}
                            </p>
                          </div>
                          <Progress
                            value={student.progress}
                            className="mt-1 h-1.5"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No students enrolled yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Course Chat
              </CardTitle>
              <CardDescription>
                Connect with{" "}
                {userRole === "tutor" ? "students" : "your tutor and peers"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Link href={`/dashboard/courses/${course.id}/chat`}>
                  Open Chat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to format video duration
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Helper function to generate random "last active" times for demo
function getRandomLastActive(): string {
  const options = [
    "Just now",
    "5 minutes ago",
    "1 hour ago",
    "2 hours ago",
    "Today",
    "Yesterday",
    "2 days ago",
    "1 week ago",
  ];
  return options[Math.floor(Math.random() * options.length)];
}
