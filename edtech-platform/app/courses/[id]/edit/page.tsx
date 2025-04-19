"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, Upload, Video } from "lucide-react"

interface CourseEditPageProps {
  params: {
    id: string
  }
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const [course, setCourse] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("0")
  const [videoTitle, setVideoTitle] = useState("")
  const [videoDescription, setVideoDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch course")
        }
        const data = await response.json()
        setCourse(data)
        setTitle(data.title)
        setDescription(data.description)
        setPrice(data.price.toString())

        // Fetch videos
        const videosResponse = await fetch(`/api/courses/${params.id}/videos`)
        if (!videosResponse.ok) {
          throw new Error("Failed to fetch videos")
        }
        const videosData = await videosResponse.json()
        setVideos(videosData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [params.id])

  const handleSaveCourse = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/courses/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price: Number.parseFloat(price),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update course")
      }

      toast({
        title: "Success",
        description: "Course updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile || !videoTitle) {
      toast({
        title: "Error",
        description: "Please provide a video title and file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("courseId", params.id)
      formData.append("title", videoTitle)
      formData.append("description", videoDescription)
      formData.append("video", videoFile)

      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload video")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      })

      // Reset form
      setVideoTitle("")
      setVideoDescription("")
      setVideoFile(null)

      // Refresh videos list
      const videosResponse = await fetch(`/api/courses/${params.id}/videos`)
      if (!videosResponse.ok) {
        throw new Error("Failed to fetch videos")
      }
      const videosData = await videosResponse.json()
      setVideos(videosData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold tracking-tight">Course not found</h1>
        <p className="text-muted-foreground">
          The course you are looking for does not exist or you don't have permission to edit it.
        </p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6 md:py-12">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
            <p className="text-muted-foreground">Manage your course content and settings</p>
          </div>
          <Button onClick={() => router.push(`/courses/${params.id}`)}>View Course</Button>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Edit your course information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter course title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter course description"
                    className="min-h-32"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveCourse} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Video</CardTitle>
                  <CardDescription>Add new video content to your course</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVideoUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoTitle">Video Title</Label>
                      <Input
                        id="videoTitle"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Enter video title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="videoDescription">Video Description</Label>
                      <Textarea
                        id="videoDescription"
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        placeholder="Enter video description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="videoFile">Video File</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {videoFile ? videoFile.name : "Drag and drop or click to upload"}
                        </p>
                        <Input
                          id="videoFile"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setVideoFile(e.target.files[0])
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("videoFile")?.click()}
                        >
                          Select File
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" disabled={isUploading || !videoFile}>
                      {isUploading ? "Uploading..." : "Upload Video"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>Manage your course videos</CardDescription>
                </CardHeader>
                <CardContent>
                  {videos.length > 0 ? (
                    <div className="divide-y border rounded-lg">
                      {videos.map((video, index) => (
                        <div key={video._id} className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Video className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{video.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {video.description ? video.description.substring(0, 50) + "..." : "No description"}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">No videos yet</h3>
                      <p className="text-muted-foreground mb-4">Upload your first video to get started</p>
                      <Button onClick={() => document.getElementById("videoFile")?.click()}>
                        <Plus className="h-4 w-4 mr-2" /> Add Video
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Configure your course settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Course Visibility</Label>
                  <select
                    id="visibility"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="draft">Draft (Only visible to you)</option>
                    <option value="published">Published (Visible to everyone)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentType">Enrollment Type</Label>
                  <select
                    id="enrollmentType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="open">Open Enrollment</option>
                    <option value="invite">Invite Only</option>
                  </select>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
