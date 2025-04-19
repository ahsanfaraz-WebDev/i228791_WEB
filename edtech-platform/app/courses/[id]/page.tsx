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

// Define type for params
interface CourseParams {
  id: string;
}

export default function CourseDetailPage({ params }: { params: CourseParams }) {
  // Extract the ID using React.use() to unwrap the params
  const courseId = React.use(params).id;

  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course details
        const courseData = await CourseService.getCourseById(courseId);
        setCourse(courseData);

        // Check if user is enrolled
        if (user) {
          const enrolled = await CourseService.isEnrolled(courseId, user.id);
          setIsEnrolled(enrolled);
        }

        // Fetch course videos regardless of enrollment
        const courseVideos = await CourseService.getCourseVideos(courseId);
        setVideos(courseVideos);
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
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

  // Calculate total course duration
  const getTotalDuration = () => {
    if (!videos || videos.length === 0) return "0 hours";

    const totalSeconds = videos.reduce(
      (acc, video) => acc + (video.duration || 0),
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours} hours ${minutes} minutes`;
  };

  // Format video duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Toggle preview video playback
  const togglePreviewVideo = () => {
    setIsPreviewPlaying(!isPreviewPlaying);
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

  // Get first video for preview
  const previewVideo = videos && videos.length > 0 ? videos[0] : null;

  // Get current active video
  const activeVideo =
    videos && videos.length > 0 ? videos[activeVideoIndex] : null;

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
                <span>{course.student_count || 0} students enrolled</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                <span>{getTotalDuration()}</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-1" />
                <span>{videos.length} videos</span>
              </div>
            </div>

            <div className="relative h-[400px] w-full rounded-lg overflow-hidden mb-6">
              {isPreviewPlaying && previewVideo ? (
                <VideoPlayer
                  videoUrl={previewVideo.video_url}
                  thumbnailUrl={
                    previewVideo.thumbnail_url || course.thumbnail_url
                  }
                  title={previewVideo.title}
                  transcript={previewVideo.transcript?.content}
                  onComplete={() => setIsPreviewPlaying(false)}
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16 bg-emerald-600 hover:bg-emerald-700"
                      onClick={togglePreviewVideo}
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
                </>
              )}
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
                {videos.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <div className="p-4 bg-muted font-medium">
                        Course Videos ({videos.length})
                      </div>
                      <div>
                        {videos.map((video, index) => (
                          <div
                            key={video.id}
                            className="p-4 border-t flex justify-between items-center group hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (isEnrolled) {
                                router.push(`/dashboard/courses/${courseId}`);
                              } else {
                                // For first video (preview), toggle preview
                                if (index === 0) {
                                  togglePreviewVideo();
                                } else {
                                  handleEnroll();
                                }
                              }
                            }}
                          >
                            <div className="flex items-center">
                              {index === 0 ? (
                                <Play className="h-4 w-4 mr-2 text-emerald-600" />
                              ) : (
                                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                              )}
                              <div>
                                <span className="font-medium">
                                  {video.title}
                                </span>
                                {index === 0 && (
                                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded dark:bg-emerald-900 dark:text-emerald-200">
                                    Preview
                                  </span>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {video.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(video.duration || 0)}
                              </span>
                              {!isEnrolled && index !== 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnroll();
                                  }}
                                >
                                  Enroll to unlock
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-muted-foreground">
                    No videos available for this course yet.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative h-24 w-24">
                      <UserAvatar
                        src={course.tutor?.avatar_url}
                        name={course.tutor?.full_name}
                        size="lg"
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
                          <p className="font-medium">
                            {course.student_count || 0}
                          </p>
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
                      <span>{videos.length} on-demand videos</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                      <span>{getTotalDuration()} of content</span>
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
                      <span>{course.student_count || 0}</span>
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
