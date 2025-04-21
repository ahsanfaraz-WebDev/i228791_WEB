import { createClient } from "@/lib/supabase/client";

export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  level: string;
  tutor_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  student_count?: number;
  tutor?: {
    id: string;
    full_name: string;
    avatar_url: string;
    bio: string;
  };
};

export type Video = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  position: number;
  created_at: string;
  updated_at: string;
  transcript?: {
    id: string;
    content: string;
  };
};

export type Enrollment = {
  id: string;
  course_id: string;
  student_id: string;
  payment_id: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
};

export type Progress = {
  id: string;
  enrollment_id: string;
  video_id: string;
  watched_seconds: number;
  completed: boolean;
  last_watched_at: string;
};

export type EnrolledCourse = Course & {
  enrollment_id: string;
  enrolled_at: string;
  progress: number;
};

export const CourseService = {
  // Get all published courses
  async getPublishedCourses() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        tutor:profiles(id, full_name, avatar_url, bio)
      `
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }

    return data as Course[];
  },

  // Get a single course by ID
  async getCourseById(id: string) {
    try {
      const supabase = createClient();

      if (!id) {
        console.error("Invalid course ID provided");
        return null;
      }

      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          *,
          tutor:profiles(id, full_name, avatar_url, bio)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Record not found error code
          console.warn(`Course with ID ${id} not found`);
          return null;
        }
        console.error(`Error fetching course with ID ${id}:`, error);
        throw new Error(`Failed to fetch course: ${error.message}`);
      }

      if (!data) {
        console.warn(`No data returned for course with ID ${id}`);
        return null;
      }

      return data as Course;
    } catch (err) {
      console.error(`Error in getCourseById for ID ${id}:`, err);
      throw new Error(
        `Failed to fetch course: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  },

  // Get videos for a course
  async getCourseVideos(courseId: string) {
    try {
      const supabase = createClient();

      if (!courseId) {
        console.error("Invalid course ID provided");
        return [];
      }

      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          transcript:transcripts(id, content)
        `
        )
        .eq("course_id", courseId)
        .order("position", { ascending: true });

      if (error) {
        console.error(`Error fetching videos for course ${courseId}:`, error);
        throw new Error(`Failed to fetch course videos: ${error.message}`);
      }

      if (!data) {
        console.warn(`No videos found for course with ID ${courseId}`);
        return [];
      }

      return data as Video[];
    } catch (err) {
      console.error(`Error in getCourseVideos for course ID ${courseId}:`, err);
      // Return empty array instead of throwing to make UI more resilient
      return [];
    }
  },

  // Create a new course
  async createCourse(courseData: Partial<Course>) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", error);
      throw error;
    }

    return data as Course;
  },

  // Update a course
  async updateCourse(id: string, courseData: Partial<Course>) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("courses")
      .update(courseData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }

    return data as Course;
  },

  // Delete a course
  async deleteCourse(id: string) {
    const supabase = createClient();

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }

    return true;
  },

  // Create a new video for a course
  async createVideo(videoData: Partial<Video>) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("videos")
      .insert(videoData)
      .select()
      .single();

    if (error) {
      console.error("Error creating video:", error);
      throw error;
    }

    return data as Video;
  },

  // Enroll a student in a course
  async enrollInCourse(courseId: string, studentId: string, paymentId: string) {
    try {
      const supabase = createClient();

      // First check if the enrollment already exists to avoid duplicates
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", studentId)
        .maybeSingle();

      // If already enrolled, return the existing enrollment
      if (existingEnrollment) {
        console.log(
          `Student ${studentId} already enrolled in course ${courseId}`
        );
        return existingEnrollment as Enrollment;
      }

      // Create new enrollment
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          course_id: courseId,
          student_id: studentId,
          payment_id: paymentId,
          payment_status: "completed",
        })
        .select()
        .single();

      if (error) {
        console.error(
          `Error enrolling student ${studentId} in course ${courseId}:`,
          error
        );
        throw new Error(`Enrollment failed: ${error.message}`);
      }

      // Update the course's student count
      await supabase
        .from("courses")
        .update({
          student_count: supabase.rpc("increment", {
            row_id: courseId,
            table: "courses",
            column: "student_count",
          }),
        })
        .eq("id", courseId);

      return data as Enrollment;
    } catch (error) {
      console.error("Enrollment process failed:", error);
      throw error;
    }
  },

  // Check if a student is enrolled in a course
  async isEnrolled(courseId: string, studentId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("enrollments")
      .select()
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (error) {
      console.error(
        `Error checking enrollment for student ${studentId} in course ${courseId}:`,
        error
      );
      throw error;
    }

    return !!data;
  },

  // Update student progress
  async updateProgress(
    enrollmentId: string,
    videoId: string,
    watchedSeconds: number,
    completed: boolean
  ) {
    try {
      if (!enrollmentId || !videoId) {
        console.error("Invalid enrollment or video ID provided");
        throw new Error("Invalid enrollment or video ID provided");
      }

      const supabase = createClient();

      // Check if progress record exists
      const { data: existingProgress, error: checkError } = await supabase
        .from("progress")
        .select()
        .eq("enrollment_id", enrollmentId)
        .eq("video_id", videoId)
        .maybeSingle();

      if (checkError) {
        // Log the full error details for debugging
        console.error(
          `Error checking progress for enrollment ${enrollmentId} and video ${videoId}:`,
          JSON.stringify(checkError)
        );
        throw new Error(
          `Error checking progress: ${
            checkError.message || checkError.code || "Unknown error"
          }`
        );
      }

      // Format data for insert/update
      const progressData = {
        watched_seconds: watchedSeconds,
        completed,
        last_watched_at: new Date().toISOString(),
      };

      let result;

      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from("progress")
          .update(progressData)
          .eq("id", existingProgress.id)
          .select()
          .single();

        if (error) {
          // Log the full error details for debugging
          console.error(
            `Error updating progress for enrollment ${enrollmentId} and video ${videoId}:`,
            JSON.stringify(error)
          );
          throw new Error(
            `Error updating progress: ${
              error.message || error.code || "Unknown error"
            }`
          );
        }

        result = data;
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from("progress")
          .insert({
            enrollment_id: enrollmentId,
            video_id: videoId,
            ...progressData,
          })
          .select()
          .single();

        if (error) {
          // Log the full error details for debugging
          console.error(
            `Error creating progress for enrollment ${enrollmentId} and video ${videoId}:`,
            JSON.stringify(error)
          );
          throw new Error(
            `Error creating progress: ${
              error.message || error.code || "Unknown error"
            }`
          );
        }

        result = data;
      }

      return result as Progress;
    } catch (err) {
      // Make sure to stringify the error object for better visibility in logs
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      console.error(
        `Progress update error for enrollment ${enrollmentId} and video ${videoId}: ${errorMessage}`
      );
      throw err;
    }
  },

  // Get student progress for a course
  async getStudentProgress(enrollmentId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("progress")
      .select(
        `
        *,
        video:videos(id, title, duration)
      `
      )
      .eq("enrollment_id", enrollmentId);

    if (error) {
      console.error(
        `Error fetching progress for enrollment ${enrollmentId}:`,
        error
      );
      throw error;
    }

    return data as (Progress & {
      video: { id: string; title: string; duration: number };
    })[];
  },

  // Get featured or popular courses
  async getFeaturedCourses(limit = 6) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        tutor:profiles(id, full_name, avatar_url, bio)
      `
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured courses:", error);
      throw error;
    }

    return data as Course[];
  },

  // Get all courses for a tutor
  async getTutorCourses(tutorId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        tutor:profiles(id, full_name, avatar_url, bio)
      `
      )
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching courses for tutor ${tutorId}:`, error);
      throw error;
    }

    return data as Course[];
  },

  // Get all courses a student is enrolled in with progress
  async getStudentCourses(studentId: string): Promise<EnrolledCourse[]> {
    const supabase = createClient();

    // First get all enrollments for this student
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        course_id,
        created_at,
        courses(*)
      `
      )
      .eq("student_id", studentId);

    if (enrollmentsError) {
      console.error(
        `Error fetching enrollments for student ${studentId}:`,
        enrollmentsError
      );
      throw enrollmentsError;
    }

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    // Transform the data into a more useful format
    const studentCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Calculate progress for this enrollment
        const progress = await this.calculateCourseProgress(
          enrollment.id,
          enrollment.course_id
        );

        // Properly handle the courses object which might be nested differently in the response
        const courseData = enrollment.courses as unknown as Course;

        // Create a properly typed EnrolledCourse object
        return {
          ...courseData,
          enrollment_id: enrollment.id,
          enrolled_at: enrollment.created_at,
          progress,
        };
      })
    );

    return studentCourses;
  },

  // Calculate overall progress for a course enrollment
  async calculateCourseProgress(enrollmentId: string, courseId: string) {
    const supabase = createClient();

    // Get all videos for this course
    const { data: videos, error: videosError } = await supabase
      .from("videos")
      .select("id")
      .eq("course_id", courseId);

    if (videosError) {
      console.error(
        `Error fetching videos for course ${courseId}:`,
        videosError
      );
      throw videosError;
    }

    if (!videos || videos.length === 0) {
      return 0; // No videos, no progress
    }

    // Get all progress records for this enrollment
    const { data: progressRecords, error: progressError } = await supabase
      .from("progress")
      .select("*")
      .eq("enrollment_id", enrollmentId);

    if (progressError) {
      console.error(
        `Error fetching progress for enrollment ${enrollmentId}:`,
        progressError
      );
      throw progressError;
    }

    if (!progressRecords || progressRecords.length === 0) {
      return 0; // No progress records, 0% progress
    }

    // Count completed videos
    const completedVideos = progressRecords.filter(
      (record) => record.completed
    ).length;

    // Calculate percentage
    return Math.round((completedVideos / videos.length) * 100);
  },

  // Get filtered courses
  async getFilteredCourses({
    category,
    minPrice,
    maxPrice,
    sort = "created_at",
    order = "desc",
  }: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    order?: "asc" | "desc";
  }) {
    const supabase = createClient();

    let query = supabase
      .from("courses")
      .select(
        `
        *,
        tutor:profiles(id, full_name, avatar_url, bio)
      `
      )
      .eq("published", true);

    // Apply filters if they exist
    if (category && category !== "all") {
      query = query.eq("level", category);
    }

    if (minPrice !== undefined) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice);
    }

    // Apply sorting
    switch (sort) {
      case "price-low":
        query = query.order("price", { ascending: true });
        break;
      case "price-high":
        query = query.order("price", { ascending: false });
        break;
      case "popular":
        query = query.order("student_count", { ascending: false });
        break;
      case "rating":
        query = query.order("average_rating", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: order === "asc" });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching filtered courses:", error);
      throw error;
    }

    return data as Course[];
  },

  // Enroll a student directly in a free course
  async enrollStudent(studentId: string, courseId: string) {
    try {
      if (!studentId || !courseId) {
        console.error("Invalid student ID or course ID");
        throw new Error("Invalid enrollment parameters");
      }

      const supabase = createClient();

      // Check if student is already enrolled
      const isAlreadyEnrolled = await this.isEnrolled(courseId, studentId);
      if (isAlreadyEnrolled) {
        console.log(
          `Student ${studentId} is already enrolled in course ${courseId}`
        );
        return true;
      }

      // Create a new enrollment for free course (no payment ID needed)
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          course_id: courseId,
          student_id: studentId,
          payment_status: "free", // Indicate this was a free enrollment
        })
        .select()
        .single();

      if (error) {
        console.error(
          `Error enrolling student ${studentId} in course ${courseId}:`,
          error
        );
        throw new Error(`Enrollment failed: ${error.message}`);
      }

      // Update the course's student count
      await supabase
        .from("courses")
        .update({
          student_count: supabase.rpc("increment", {
            row_id: courseId,
            table_name: "courses",
            column_name: "student_count",
          }),
        })
        .eq("id", courseId);

      return true;
    } catch (err) {
      console.error("Error in enrollStudent:", err);
      throw new Error(
        `Failed to enroll in course: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  },
};
