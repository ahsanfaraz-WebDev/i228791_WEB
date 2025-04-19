"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Video } from "lucide-react"

export default function DashboardStudent() {
  const [enrolledCourses] = useState([
    {
      id: "1",
      title: "Introduction to Web Development",
      instructor: "Jane Smith",
      progress: 45,
      lastAccessed: "2 days ago",
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "2",
      title: "Advanced JavaScript Concepts",
      instructor: "John Doe",
      progress: 20,
      lastAccessed: "1 week ago",
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
  ])

  const [recommendedCourses] = useState([
    {
      id: "3",
      title: "React for Beginners",
      instructor: "Sarah Johnson",
      rating: 4.8,
      students: 1245,
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "4",
      title: "Node.js Fundamentals",
      instructor: "Michael Brown",
      rating: 4.6,
      students: 987,
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "5",
      title: "Full Stack Development",
      instructor: "David Wilson",
      rating: 4.9,
      students: 2341,
      thumbnail: "/placeholder.svg?height=100&width=200",
    },
  ])

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Edu</span>Verse
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/courses" className="text-sm font-medium hover:text-primary">
              Browse Courses
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-primary">
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-12">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Continue your learning journey.</p>
          </div>

          <Tabs defaultValue="enrolled" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="enrolled">My Courses</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
            </TabsList>
            <TabsContent value="enrolled" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader className="p-0">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>Instructor: {course.instructor}</CardDescription>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last accessed {course.lastAccessed}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full">Continue Learning</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="recommended" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedCourses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader className="p-0">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>Instructor: {course.instructor}</CardDescription>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(course.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300 fill-gray-300"
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-sm text-muted-foreground">({course.students} students)</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" className="w-full">
                        View Course
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="rounded-full bg-primary/10 p-2">
                  <Video className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Watched "CSS Grid Layout"</h3>
                  <p className="text-sm text-muted-foreground">Introduction to Web Development • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="rounded-full bg-primary/10 p-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Completed "JavaScript Basics" quiz</h3>
                  <p className="text-sm text-muted-foreground">Advanced JavaScript Concepts • 3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
