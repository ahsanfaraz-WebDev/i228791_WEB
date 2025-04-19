import { createClient } from "@/lib/supabase/client"

export type Course = {
  id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  level: string
  tutor_id: string
  published: boolean
  created_at: string
  updated_at: string
  tutor?: {
    id: string
    full_name: string
    avatar_url: string
    bio: string
  }
}

export type Video = {
  id: string
  course_id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  position: number
  created_at: string
  updated_at: string
  transcript?: {
    id: string
    content: string
  }
}

export type Enrollment = {
  id: string
  course_id: string
  student_id: string
  payment_id: string
  payment_status: string
  created_at: string
  updated_at: string
}

export type Progress = {
  id: string
  enrollment_id: string
  video_id: string
  watched_seconds: number
  completed: boolean
  last_watched_at: string
}

export const CourseService = {
  // Get all published courses
  async getPublishedCourses() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        tutor:profiles(id, full_name, avatar_url, bio)
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching courses:", error)
      throw error
    }

    return data as Course[]
  },

  // Get a single course by ID
  async getCourseById(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        tutor:profiles(id, full_name, avatar_url, bio)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching course with ID ${id}:`, error)
      throw error
    }

    return data as Course
  },

  // Get videos for a course
  async getCourseVideos(courseId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        transcript:transcripts(id, content)
      `)
      .eq("course_id", courseId)
      .order("position", { ascending: true })

    if (error) {
      console.error(`Error fetching videos for course ${courseId}:`, error)
      throw error
    }

    return data as Video[]
  },

  // Create a new course
  async createCourse(courseData: Partial<Course>) {
    const supabase = createClient()

    const { data, error } = await supabase.from("courses").insert(courseData).select().single()

    if (error) {
      console.error("Error creating course:", error)
      throw error
    }

    return data as Course
  },

  // Update a course
  async updateCourse(id: string, courseData: Partial<Course>) {
    const supabase = createClient()

    const { data, error } = await supabase.from("courses").update(courseData).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating course ${id}:`, error)
      throw error
    }

    return data as Course
  },

  // Delete a course
  async deleteCourse(id: string) {
    const supabase = createClient()

    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting course ${id}:`, error)
      throw error
    }

    return true
  },

  // Enroll a student in a course
  async enrollInCourse(courseId: string, studentId: string, paymentId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        course_id: courseId,
        student_id: studentId,
        payment_id: paymentId,
        payment_status: "completed",
      })
      .select()
      .single()

    if (error) {
      console.error(`Error enrolling student ${studentId} in course ${courseId}:`, error)
      throw error
    }

    return data as Enrollment
  },

  // Check if a student is enrolled in a course
  async isEnrolled(courseId: string, studentId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("enrollments")
      .select()
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .maybeSingle()

    if (error) {
      console.error(`Error checking enrollment for student ${studentId} in course ${courseId}:`, error)
      throw error
    }

    return !!data
  },

  // Update student progress
  async updateProgress(enrollmentId: string, videoId: string, watchedSeconds: number, completed: boolean) {
    const supabase = createClient()

    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from("progress")
      .select()
      .eq("enrollment_id", enrollmentId)
      .eq("video_id", videoId)
      .maybeSingle()

    if (checkError) {
      console.error(`Error checking progress for enrollment ${enrollmentId} and video ${videoId}:`, checkError)
      throw checkError
    }

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from("progress")
        .update({
          watched_seconds: watchedSeconds,
          completed,
          last_watched_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating progress for enrollment ${enrollmentId} and video ${videoId}:`, error)
        throw error
      }

      return data as Progress
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from("progress")
        .insert({
          enrollment_id: enrollmentId,
          video_id: videoId,
          watched_seconds: watchedSeconds,
          completed,
          last_watched_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating progress for enrollment ${enrollmentId} and video ${videoId}:`, error)
        throw error
      }

      return data as Progress
    }
  },

  // Get student progress for a course
  async getStudentProgress(enrollmentId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("progress")
      .select(`
        *,
        video:videos(id, title, duration)
      `)
      .eq("enrollment_id", enrollmentId)

    if (error) {
      console.error(`Error fetching progress for enrollment ${enrollmentId}:`, error)
      throw error
    }

    return data as (Progress & { video: { id: string; title: string; duration: number } })[]
  },
}
