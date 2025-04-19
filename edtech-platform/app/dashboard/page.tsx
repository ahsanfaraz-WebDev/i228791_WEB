"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Video, Users, MessageSquare, Plus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import type { Course } from "@/lib/services/course-service"
import { toast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch user profile to get role
        const supabase = createClient()
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile) {
          setUserRole(profile.role)
        }

        // Fetch courses based on role
        if (profile?.role === "tutor") {
          // Fetch courses created by this tutor
          const { data: tutorCourses } = await supabase
            .from("courses")
            .select("*")
            .eq("tutor_id", user.id)
            .order("created_at", { ascending: false })

          setCourses(tutorCourses || [])
        } else {
          // Fetch courses enrolled by this student
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select(`
              *,
              course:courses(*)
            `)
            .eq("student_id", user.id)

          const enrolledCoursesData =
            enrollments?.map((enrollment) => ({
              ...enrollment.course,
              enrollment_id: enrollment.id,
              progress: Math.floor(Math.random() * 100), // Mock progress for now
            })) || []

          setEnrolledCourses(enrolledCoursesData)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p>Please log in to view your dashboard.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  const displayCourses = userRole === "tutor" ? courses : enrolledCourses

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {userRole === "tutor" && (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Courses</h2>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard/create-course">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Link>
              </Button>
            </div>
          )}

          {displayCourses.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                {userRole === "tutor"
                  ? "You haven't created any courses yet"
                  : "You're not enrolled in any courses yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {userRole === "tutor"
                  ? "Start creating your first course to share your knowledge"
                  : "Browse our courses and enroll to start learning"}
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href={userRole === "tutor" ? "/dashboard/create-course" : "/courses"}>
                  {userRole === "tutor" ? "Create Course" : "Browse Courses"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={course.thumbnail_url || "/placeholder.svg?height=200&width=350"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Video className="mr-1 h-4 w-4" />
                        {/* Mock data for videos count */}
                        {Math.floor(Math.random() * 20) + 5} videos
                      </div>
                      {userRole === "tutor" ? (
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {/* Mock data for enrolled students */}
                          {Math.floor(Math.random() * 100) + 10} enrolled
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <BookOpen className="mr-1 h-4 w-4" />
                          {course.progress}% complete
                        </div>
                      )}
                    </div>

                    {userRole === "student" && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/courses/${course.id}`}>
                        {userRole === "tutor" ? "Manage Course" : "Continue Learning"}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Recent Messages
              </CardTitle>
              <CardDescription>
                Stay connected with your {userRole === "tutor" ? "students" : "tutors"} and peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
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
                          {userRole === "tutor" ? "Alex Chen (Student)" : "Prof. Sarah Johnson"}
                        </h4>
                        <p className="text-sm text-muted-foreground">Introduction to Web Development</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm">
                    Hi, I had a question about the latest assignment. Could you clarify the requirements for the final
                    project?
                  </p>
                </div>

                <div className="border rounded-lg p-4">
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
                          {userRole === "tutor" ? "Maria Lopez (Student)" : "Dr. Michael Chen"}
                        </h4>
                        <p className="text-sm text-muted-foreground">Advanced React Patterns</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                  <p className="text-sm">
                    Thanks for the feedback on my last submission! I've implemented the changes you suggested.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/messages">View All Messages</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Statistics</CardTitle>
              <CardDescription>Track your progress and performance on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-lg font-medium mb-1">
                    {userRole === "tutor" ? "Total Students" : "Courses Enrolled"}
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">{userRole === "tutor" ? "429" : "5"}</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-lg font-medium mb-1">
                    {userRole === "tutor" ? "Total Courses" : "Hours Learned"}
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">{userRole === "tutor" ? "3" : "27"}</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-lg font-medium mb-1">
                    {userRole === "tutor" ? "Total Revenue" : "Certificates Earned"}
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">{userRole === "tutor" ? "$2,845" : "2"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function createClient() {
  // Import dynamically to avoid server/client mismatch
  const { createClient: createBrowserClient } = require("@/lib/supabase/client")
  return createBrowserClient()
}
