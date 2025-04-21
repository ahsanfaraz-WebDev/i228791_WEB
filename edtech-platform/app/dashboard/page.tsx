"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Video,
  Users,
  MessageSquare,
  Plus,
  Trophy,
  BookMarked,
  Brain,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  CourseService,
  type Course,
  type EnrolledCourse,
} from "@/lib/services/course-service";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { gsap } from "gsap";
import {
  Dashboard3D,
  LearningStats,
  FeatureCard,
} from "@/components/dashboard/dashboard-3d";
import { CourseActions } from "@/components/courses/course-actions";

// Define a generic type for courses that may or may not have progress
type CourseWithOptionalProgress = Course & {
  progress?: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [courseVideos, setCourseVideos] = useState<{
    [courseId: string]: number;
  }>({});
  const [enrollmentCounts, setEnrollmentCounts] = useState<{
    [courseId: string]: number;
  }>({});

  useEffect(() => {
    // Animate the header
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }

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

        // Fetch featured courses regardless of role
        const featuredData = await CourseService.getFeaturedCourses(4);
        setFeaturedCourses(featuredData);

        // For each course, fetch the videos count - make this function accept CourseWithOptionalProgress[]
        const fetchVideosCount = async (
          courses: CourseWithOptionalProgress[]
        ) => {
          const videoCountMap: { [courseId: string]: number } = {};

          await Promise.all(
            courses.map(async (course) => {
              try {
                const videos = await CourseService.getCourseVideos(course.id);
                videoCountMap[course.id] = videos.length;
              } catch (error) {
                console.error(
                  `Error fetching videos for course ${course.id}:`,
                  error
                );
                videoCountMap[course.id] = 0;
              }
            })
          );

          setCourseVideos(videoCountMap);
        };

        // Fetch enrollment counts for courses if user is a tutor
        const fetchEnrollmentCounts = async (courses: Course[]) => {
          if (profile?.role !== "tutor") return;

          const countMap: { [courseId: string]: number } = {};

          await Promise.all(
            courses.map(async (course) => {
              try {
                const { count, error } = await supabase
                  .from("enrollments")
                  .select("*", { count: "exact", head: true })
                  .eq("course_id", course.id);

                if (error) throw error;
                countMap[course.id] = count || 0;
              } catch (error) {
                console.error(
                  `Error fetching enrollment count for course ${course.id}:`,
                  error
                );
                countMap[course.id] = 0;
              }
            })
          );

          setEnrollmentCounts(countMap);
        };

        // Fetch video counts and enrollments for the appropriate course list
        if (profile?.role === "tutor") {
          const tutorCourses = await CourseService.getTutorCourses(user.id);
          setCourses(tutorCourses);
          fetchVideosCount(tutorCourses);
          fetchEnrollmentCounts(tutorCourses);
        } else {
          const studentCourses = await CourseService.getStudentCourses(user.id);
          setEnrolledCourses(studentCourses);
          fetchVideosCount(studentCourses);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p>Please log in to view your dashboard.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  const displayCourses = userRole === "tutor" ? courses : enrolledCourses;

  return (
    <div className="container py-10">
      <h1
        ref={headerRef}
        className="text-4xl font-bold mb-8 blue-gradient-text"
      >
        Welcome to Your Learning Dashboard
      </h1>

      {/* Hero Section with 3D Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-8 shadow-sm">
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">
            {userRole === "tutor"
              ? "Empower Students with Your Knowledge"
              : "Your Learning Journey Awaits"}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {userRole === "tutor"
              ? "Create engaging courses, monitor student progress, and make an impact in education."
              : "Track your progress, engage with tutors, and take your skills to the next level."}
          </p>
          <Button asChild className="w-fit btn-google">
            <Link
              href={
                userRole === "tutor" ? "/dashboard/create-course" : "/courses"
              }
            >
              {userRole === "tutor"
                ? "Create New Course"
                : "Explore More Courses"}
            </Link>
          </Button>
        </div>
        <div>
          <Dashboard3D />
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(4)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-64 bg-muted animate-pulse rounded-lg"
                ></div>
              ))
          ) : featuredCourses.length > 0 ? (
            // Display actual featured courses
            featuredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={
                      course.thumbnail_url ||
                      "/placeholder.svg?height=128&width=256"
                    }
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-2">
                    <p className="text-white text-xs font-medium">
                      {course.level?.charAt(0).toUpperCase() +
                        course.level?.slice(1) || "Intermediate"}
                    </p>
                  </div>
                </div>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-0 px-4 text-xs mt-auto">
                  <div className="flex justify-between text-muted-foreground">
                    <span>${Number(course.price).toFixed(2)}</span>
                    <span>
                      {course.tutor?.full_name || "Unknown Instructor"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Link href={`/courses/${course.id}`}>View Course</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            // Fallback to feature cards if no featured courses
            <>
              <FeatureCard
                icon={BookMarked}
                title="Interactive Courses"
                description="Engage with rich multimedia content and interactive lessons."
                color="#10b981"
              />
              <FeatureCard
                icon={Brain}
                title="AI-Powered Learning"
                description="Personalized learning paths adapted to your unique needs."
                color="#3b82f6"
              />
              <FeatureCard
                icon={Trophy}
                title="Achievement System"
                description="Earn certificates and badges as you complete courses."
                color="#8b5cf6"
              />
              <FeatureCard
                icon={Calendar}
                title="Learning Schedule"
                description="Plan your study time with our smart scheduling tools."
                color="#f59e0b"
              />
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-full">
          <TabsTrigger
            value="courses"
            className="rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            My Courses
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Learning Stats
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {userRole === "tutor" && (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Courses</h2>
              <Button asChild className="btn-google">
                <Link href="/dashboard/create-course">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Link>
              </Button>
            </div>
          )}

          {displayCourses.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-secondary/20 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {userRole === "tutor"
                  ? "You haven't created any courses yet"
                  : "You're not enrolled in any courses yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {userRole === "tutor"
                  ? "Start creating your first course to share your knowledge"
                  : "Browse our courses and enroll to start learning"}
              </p>
              <Button asChild className="btn-google">
                <Link
                  href={
                    userRole === "tutor"
                      ? "/dashboard/create-course"
                      : "/courses"
                  }
                >
                  {userRole === "tutor" ? "Create Course" : "Browse Courses"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 rounded-2xl"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={
                        course.thumbnail_url ||
                        "/placeholder.svg?height=200&width=350"
                      }
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <p className="text-white font-medium text-sm">
                        {course.level?.charAt(0).toUpperCase() +
                          course.level?.slice(1) || "Intermediate"}
                      </p>
                    </div>
                    {userRole === "tutor" && (
                      <div className="absolute top-2 right-2">
                        <CourseActions
                          courseId={course.id}
                          courseTitle={course.title}
                          isTutor={true}
                        />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Video className="mr-1 h-4 w-4" />
                        {courseVideos[course.id] || 0} videos
                      </div>
                      {userRole === "tutor" ? (
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {enrollmentCounts[course.id] || 0} enrolled
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <BookOpen className="mr-1 h-4 w-4" />
                          {course.progress || 0}% complete
                        </div>
                      )}
                    </div>

                    {userRole === "student" && (
                      <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-gray-200 hover:bg-secondary/30 hover:text-primary hover:border-primary/20"
                    >
                      <Link href={`/dashboard/courses/${course.id}`}>
                        {userRole === "tutor"
                          ? "Manage Course"
                          : "Continue Learning"}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  Track your learning journey and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LearningStats />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {userRole === "tutor"
                    ? "Your Teaching Impact"
                    : "Your Learning Activity"}
                </CardTitle>
                <CardDescription>
                  {userRole === "tutor"
                    ? `You have created ${
                        courses.length
                      } courses with ${Object.values(enrollmentCounts).reduce(
                        (a, b) => a + b,
                        0
                      )} total enrollments`
                    : "Your learning activity over the past week"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {userRole === "tutor" ? (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div
                        key={course.id}
                        className="flex justify-between items-center p-2 rounded hover:bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {courseVideos[course.id] || 0} videos
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          <span>{enrollmentCounts[course.id] || 0}</span>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        You haven't created any courses yet
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-end h-44">
                    {[35, 65, 40, 85, 50, 75, 30].map((height, i) => (
                      <div
                        key={i}
                        className="w-8 bg-gray-200 dark:bg-gray-700 rounded-t-md relative group"
                      >
                        <div
                          className="absolute bottom-0 w-full bg-emerald-600 rounded-t-md transition-all duration-500"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {height}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!userRole || userRole === "student" ? (
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Recent Messages
              </CardTitle>
              <CardDescription>
                Stay connected with your{" "}
                {userRole === "tutor" ? "students" : "tutors"} and peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="User Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {userRole === "tutor"
                            ? "Alex Chen (Student)"
                            : "Prof. Sarah Johnson"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Introduction to Web Development
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>
                  <p className="text-sm">
                    Hi, I had a question about the latest assignment. Could you
                    clarify the requirements for the final project?
                  </p>
                </div>

                {/* Add more messages here */}
              </div>

              <div className="mt-6 text-center">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/dashboard/messages">View All Messages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
