"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Upload, Plus, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { CourseService } from "@/lib/services/course-service";

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<
    { title: string; description: string; file: File | null }[]
  >([{ title: "", description: "", file: null }]);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    level: "beginner",
    thumbnail_url: "/placeholder.svg?height=200&width=350", // Default placeholder
    published: false,
  });

  const addVideoField = () => {
    setVideos([...videos, { title: "", description: "", file: null }]);
  };

  const removeVideoField = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    setVideos(newVideos);
  };

  const updateVideoTitle = (index: number, title: string) => {
    const newVideos = [...videos];
    newVideos[index].title = title;
    setVideos(newVideos);
  };

  const updateVideoDescription = (index: number, description: string) => {
    const newVideos = [...videos];
    newVideos[index].description = description;
    setVideos(newVideos);
  };

  const updateVideoFile = (index: number, file: File | null) => {
    const newVideos = [...videos];
    newVideos[index].file = file;
    setVideos(newVideos);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCourseData({
      ...courseData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCourseData({
      ...courseData,
      [name]: checked,
    });
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a course.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the course in Supabase
      const newCourse = await CourseService.createCourse({
        title: courseData.title,
        description: courseData.description,
        price: Number.parseFloat(courseData.price),
        level: courseData.level,
        thumbnail_url: courseData.thumbnail_url,
        published: courseData.published,
        tutor_id: user.id,
      });

      // In a real app, you would upload videos and create video records
      // For now, we'll just simulate success

      toast({
        title: "Course created!",
        description: "Your course has been successfully created.",
      });

      router.push(`/dashboard/courses/${newCourse.id}`);
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
        <p>Please log in to create a course.</p>
        <Button asChild className="mt-4">
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>

      <form onSubmit={onSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Provide the basic information about your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Introduction to Machine Learning"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of your course"
                  className="min-h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 49.99"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Course Level</Label>
                <Select
                  value={courseData.level}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Course Thumbnail</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="h-6 w-6" />
                    <span>Upload Image</span>
                    <span className="text-xs text-muted-foreground">
                      Recommended: 1280×720px
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                Add videos to your course. Each video will be automatically
                transcribed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="space-y-4 p-4 border rounded-lg relative"
                >
                  {videos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeVideoField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`video-title-${index}`}>Video Title</Label>
                    <Input
                      id={`video-title-${index}`}
                      value={video.title}
                      onChange={(e) => updateVideoTitle(index, e.target.value)}
                      placeholder="e.g., Introduction to the Course"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`video-description-${index}`}>
                      Video Description
                    </Label>
                    <Textarea
                      id={`video-description-${index}`}
                      value={video.description}
                      onChange={(e) =>
                        updateVideoDescription(index, e.target.value)
                      }
                      placeholder="Describe what this video covers"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`video-file-${index}`}>Video File</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-20 border-dashed flex flex-col items-center justify-center gap-1"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "video/*";
                        input.onchange = (e) => {
                          const file =
                            (e.target as HTMLInputElement).files?.[0] || null;
                          updateVideoFile(index, file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-5 w-5" />
                      <span>
                        {video.file ? video.file.name : "Upload Video"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        MP4, MOV, or WebM format
                      </span>
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addVideoField}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Video
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Configure additional settings for your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="publish"
                  name="published"
                  checked={courseData.published}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                />
                <Label htmlFor="publish">Publish course immediately</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="comments"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  defaultChecked
                />
                <Label htmlFor="comments">
                  Enable comments and discussions
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="certificate"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  defaultChecked
                />
                <Label htmlFor="certificate">
                  Issue certificates upon completion
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Course..." : "Create Course"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
