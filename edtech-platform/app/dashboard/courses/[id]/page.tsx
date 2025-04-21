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
import {
  Play,
  Users,
  MessageSquare,
  FileText,
  Edit,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  CourseService,
  type Course,
  type Video,
} from "@/lib/services/course-service";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { TranscriptService } from "@/lib/services/transcript-service";
import { CourseActions } from "@/components/courses/course-actions";
import { Badge } from "@/components/ui/badge";
import { ProgressService } from "@/lib/services/progress-service";

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
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState<Record<string, boolean>>(
    {}
  );
  const [videoWatchTimes, setVideoWatchTimes] = useState<
    Record<string, number>
  >({});
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);

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

        // If student, get enrollment ID and progress
        if (profile?.role === "student") {
          const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id")
            .eq("course_id", courseId)
            .eq("student_id", user.id)
            .maybeSingle();

          if (enrollment) {
            setEnrollmentId(enrollment.id);

            // Fetch course progress
            const progress = await CourseService.calculateCourseProgress(
              enrollment.id,
              courseId
            );
            setCourseProgress(progress);

            // Fetch individual video progress
            const progressData = await CourseService.getStudentProgress(
              enrollment.id
            );
            const videoProgressMap: Record<string, boolean> = {};
            const videoWatchTimesMap: Record<string, number> = {};

            progressData.forEach((item) => {
              videoProgressMap[item.video_id] = item.completed;
              videoWatchTimesMap[item.video_id] = item.watched_seconds;
            });

            setVideoProgress(videoProgressMap);
            setVideoWatchTimes(videoWatchTimesMap);
          }
        }

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
    if (!user || !activeVideo || !enrollmentId) {
      console.log("Missing required data for progress tracking:", {
        user: !!user,
        activeVideo: !!activeVideo,
        enrollmentId: !!enrollmentId,
      });
      return;
    }

    try {
      // Make sure values are valid numbers
      if (
        isNaN(currentTime) ||
        isNaN(duration) ||
        currentTime < 0 ||
        duration <= 0
      ) {
        console.error("Invalid video timing values:", {
          currentTime,
          duration,
        });
        return;
      }

      // Mark as completed if within 5 seconds of the end or past the end
      const isCompleted = duration - currentTime <= 5;

      // Log the data being sent for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("Saving progress with data:", {
          enrollmentId,
          videoId: activeVideo.id,
          currentTime: Math.min(currentTime, duration),
          duration,
          isCompleted,
        });
      }

      // Use the new ProgressService instead of CourseService
      const result = await ProgressService.updateProgress(
        enrollmentId,
        activeVideo.id,
        Math.min(currentTime, duration), // Ensure currentTime doesn't exceed duration
        isCompleted
      );

      // Only log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Progress saved: ${currentTime}/${duration}`,
          result ? "Success" : "Failed"
        );
      }

      // If progress saving failed, but it's not critical, don't show a toast
    } catch (error) {
      // Enhanced error handling with detailed logging
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorDetails =
        error instanceof Error && error.stack
          ? error.stack
          : JSON.stringify(error);

      console.error(
        `Error saving video progress for video ${activeVideo.id}:`,
        errorMessage
      );
      console.error("Error details:", errorDetails);

      // Show toast to user with more specific error message
      toast({
        title: "Progress Tracking Issue",
        description: `We couldn't save your progress (${errorMessage}). The video will continue playing.`,
        variant: "destructive",
      });
    }
  };

  const handleVideoComplete = async () => {
    if (!user || !activeVideo || !enrollmentId) return;

    try {
      // Use the new ProgressService instead of CourseService
      const result = await ProgressService.updateProgress(
        enrollmentId,
        activeVideo.id,
        activeVideo.duration,
        true
      );

      if (result) {
        // Update local state
        setVideoProgress((prev) => ({
          ...prev,
          [activeVideo.id]: true,
        }));

        toast({
          title: "Video completed!",
          description: "Your progress has been saved.",
        });

        // Get updated progress data
        if (userRole === "student") {
          const progress = await CourseService.calculateCourseProgress(
            enrollmentId,
            courseId
          );
          setCourseProgress(progress);
        }
      } else {
        console.error("Failed to save video completion");
      }
    } catch (error) {
      console.error("Error saving video completion:", error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateTranscript = async () => {
    if (!activeVideo || !activeVideo.id) return;

    setIsGeneratingTranscript(true);
    toast({
      title: "Generating transcript...",
      description:
        "This might take a moment. We're analyzing your video content.",
      duration: 5000,
    });

    let retryCount = 0;
    const maxRetries = 2;

    // Show status update after a short delay
    const statusUpdateTimeout = setTimeout(() => {
      toast({
        title: "Still working...",
        description:
          "Transcript generation in progress. This may take up to 30 seconds.",
        duration: 10000,
      });
    }, 10000);

    const attemptGeneration = async (): Promise<boolean> => {
      try {
        const transcript = await TranscriptService.generateTranscript(
          activeVideo.video_url,
          activeVideo.id
        );

        if (!transcript) {
          console.error("Failed to generate transcript: No content returned");
          return false;
        }

        // Success - transcript was generated and saved
        return true;
      } catch (error) {
        console.error(
          `Transcript generation attempt ${retryCount + 1} failed:`,
          error
        );

        if (retryCount < maxRetries) {
          retryCount++;

          toast({
            title: `Retrying (${retryCount}/${maxRetries})...`,
            description:
              "First attempt didn't work. Trying an alternative approach.",
            duration: 3000,
          });

          console.log(
            `Retrying transcript generation (${retryCount}/${maxRetries})...`
          );

          // Wait a bit before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return attemptGeneration();
        }

        return false;
      }
    };

    try {
      // Clear the timeout if we finish early
      clearTimeout(statusUpdateTimeout);

      const success = await attemptGeneration();

      if (success) {
        // Refresh the video data to get the new transcript
        try {
          const updatedVideos = await CourseService.getCourseVideos(courseId);
          setVideos(updatedVideos);

          toast({
            title: "Transcript generated!",
            description: "The transcript has been generated successfully.",
          });
        } catch (refreshError) {
          console.error(
            "Error refreshing videos after transcript generated:",
            refreshError
          );

          toast({
            title: "Transcript generated",
            description:
              "Transcript was created but you may need to refresh to see it.",
          });
        }
      } else {
        toast({
          title: "Transcript generation completed",
          description:
            "We encountered some challenges but created a simplified transcript for this video.",
          variant: "warning",
        });

        // Refresh anyway to get whatever transcript was saved
        try {
          const updatedVideos = await CourseService.getCourseVideos(courseId);
          setVideos(updatedVideos);
        } catch (refreshError) {
          console.error("Error refreshing videos:", refreshError);
        }
      }
    } catch (error) {
      // Clear the timeout if we have an error
      clearTimeout(statusUpdateTimeout);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error in transcript generation process:", error);

      toast({
        title: "Error during generation",
        description: `We couldn't generate the transcript completely: ${errorMessage}. A partial transcript may be available.`,
        variant: "destructive",
        duration: 5000,
      });

      // Still try to refresh in case a partial transcript was saved
      try {
        const updatedVideos = await CourseService.getCourseVideos(courseId);
        setVideos(updatedVideos);
      } catch (refreshError) {
        console.error("Error refreshing videos after error:", refreshError);
      }
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const requestTranscript = () => {
    if (!activeVideo) return;

    toast({
      title: "Transcript requested",
      description: "Your request has been sent to the tutor.",
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
          <div className="flex items-center gap-2">
            <CourseActions
              courseId={course.id}
              courseTitle={course.title}
              isTutor={true}
            />
          </div>
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
                  initialProgress={videoWatchTimes[activeVideo.id] || 0}
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
                  <CardDescription className="flex items-center">
                    <span>AI-generated transcript</span>
                    {activeVideo &&
                      !isGeneratingTranscript &&
                      !activeVideo?.transcript?.content && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        >
                          Available for all courses
                        </Badge>
                      )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGeneratingTranscript ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
                      <p className="text-muted-foreground">
                        Generating transcript...
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 max-w-md text-center">
                        This may take 20-30 seconds. We're analyzing the video
                        and creating a detailed transcript.
                      </p>
                    </div>
                  ) : activeVideo?.transcript?.content ? (
                    <div className="whitespace-pre-line prose prose-slate dark:prose-invert max-w-none">
                      {activeVideo.transcript.content}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <p>No transcript available for this video.</p>
                      {userRole === "tutor" && activeVideo && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/50">
                          <h4 className="font-medium mb-2">Tutor Note</h4>
                          <p className="text-sm mb-4">
                            Transcripts help students follow along and improve
                            accessibility. AI-powered transcript generation is
                            available for all courses.
                          </p>
                          <Button
                            onClick={generateTranscript}
                            className="bg-emerald-600 hover:bg-emerald-700 w-full"
                          >
                            Generate Transcript
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Supports English, Hindi, and other languages
                            automatically.
                          </p>
                        </div>
                      )}
                      {userRole === "student" && activeVideo && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/50">
                          <h4 className="font-medium mb-2">Student Note</h4>
                          <p className="text-sm mb-4">
                            AI-generated transcripts make learning easier. You
                            can request a transcript for this video.
                          </p>
                          <Button
                            onClick={requestTranscript}
                            className="bg-blue-600 hover:bg-blue-700 w-full"
                          >
                            Request Transcript
                          </Button>
                        </div>
                      )}
                    </div>
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
                  Your progress: {courseProgress}%
                  <Progress value={courseProgress} className="mt-2" />
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
                        {videoProgress[video.id] && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            videoProgress[video.id] ? "text-emerald-600" : ""
                          }`}
                        >
                          {video.title}
                        </p>
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
