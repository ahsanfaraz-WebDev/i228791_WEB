import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Clock, Users, Video } from "lucide-react"
import ChatRoom from "@/components/chat-room"

interface CoursePageProps {
  params: {
    id: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  const { db } = await connectToDatabase()

  // Get user from session
  const user = await db.collection("users").findOne({ email: session.user.email })

  if (!user) {
    redirect("/login")
  }

  // Get course
  const course = await db.collection("courses").findOne({
    _id: new ObjectId(params.id),
  })

  if (!course) {
    redirect("/courses")
  }

  // Check if user is instructor or enrolled student
  const isInstructor = course.instructorId.equals(user._id)
  const isEnrolled = course.students.some((studentId: ObjectId) => studentId.equals(user._id))

  if (!isInstructor && !isEnrolled) {
    // User is not enrolled, show course preview
    return (
      <div className="container py-6 md:py-12">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground">Instructor: {course.instructorName}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">About this course</h2>
                <p>{course.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">What you'll learn</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Course learning objective 1</li>
                  <li>Course learning objective 2</li>
                  <li>Course learning objective 3</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">Course content preview</h2>
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span>{course.videos?.length || 0} videos</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {course.videos?.length ? "Some content locked" : "No videos yet"}
                    </span>
                  </div>

                  {course.videos?.length > 0 ? (
                    <div className="divide-y">
                      {course.videos.slice(0, 2).map((videoId: ObjectId, index: number) => (
                        <div key={index} className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {index + 1}. Video title {index + 1}
                            </span>
                            {index === 0 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Preview
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">10:30</span>
                        </div>
                      ))}

                      <div className="p-4 flex justify-between items-center bg-muted/50">
                        <span className="text-sm font-medium">Enroll to unlock all {course.videos.length} videos</span>
                        <span className="text-sm text-muted-foreground">🔒</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">No preview available</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="border rounded-lg overflow-hidden sticky top-20">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-6">
                  <div className="text-3xl font-bold">{course.price ? `$${course.price}` : "Free"}</div>

                  <Button className="w-full">Enroll Now</Button>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{course.students?.length || 0} students enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span>{course.videos?.length || 0} videos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get videos for the course
  const videos = await db
    .collection("videos")
    .find({ courseId: new ObjectId(params.id) })
    .toArray()

  // User is enrolled or is the instructor, show full course
  return (
    <div className="container py-6 md:py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground">Instructor: {course.instructorName}</p>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  {videos.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Video player would be here
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">No videos available</div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold">{videos.length > 0 ? videos[0].title : "No video selected"}</h2>

                  {videos.length > 0 && (
                    <div className="space-y-4">
                      <p>{videos[0].description}</p>

                      <div className="border rounded-lg p-4 bg-muted/50">
                        <h3 className="font-medium mb-2">AI-Generated Transcript</h3>
                        <p className="text-sm text-muted-foreground">
                          {videos[0].transcription || "No transcription available"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="border rounded-lg overflow-hidden sticky top-20">
                  <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-medium">Course Content</h3>
                    <p className="text-sm text-muted-foreground">
                      {videos.length} {videos.length === 1 ? "video" : "videos"}
                    </p>
                  </div>

                  <div className="divide-y max-h-[500px] overflow-y-auto">
                    {videos.length > 0 ? (
                      videos.map((video, index) => (
                        <div
                          key={video._id.toString()}
                          className="p-4 flex justify-between items-center hover:bg-muted/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {index + 1}. {video.title}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">10:30</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">No videos available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatRoom courseId={params.id} userId={user._id.toString()} />
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">About this course</h2>
                  <p>{course.description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-2">Instructor</h2>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" alt={course.instructorName} />
                      <AvatarFallback>{course.instructorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{course.instructorName}</h3>
                      <p className="text-sm text-muted-foreground">Course Instructor</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="border rounded-lg p-6 space-y-4 sticky top-20">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{course.students?.length || 0} students enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {videos.length} {videos.length === 1 ? "video" : "videos"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
