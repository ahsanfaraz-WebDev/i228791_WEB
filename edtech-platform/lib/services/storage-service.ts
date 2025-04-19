import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Define the available storage buckets
const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  COURSES: "courses",
  VIDEOS: "videos",
};

export const StorageService = {
  /**
   * Upload a file to Supabase storage
   * @param file The file to upload
   * @param bucket The storage bucket ("avatars", "courses", "videos")
   * @param path Optional additional path within the bucket
   * @returns The URL path of the uploaded file
   */
  async uploadFile(
    file: File,
    bucket: string,
    path: string = ""
  ): Promise<string> {
    try {
      if (!file) {
        throw new Error("No file provided for upload");
      }

      const supabase = createClient();

      // Check if bucket is valid (don't try to create it)
      if (!Object.values(STORAGE_BUCKETS).includes(bucket)) {
        console.error(`Invalid bucket: ${bucket}`);
        throw new Error(`Invalid storage bucket: ${bucket}`);
      }

      // Generate a unique filename to prevent collisions
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      console.log(
        `Uploading ${file.name} (${file.size} bytes) to ${bucket}/${filePath}`
      );

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Error uploading file:", error);

        // Handle common errors
        if (error.message?.includes("bucket not found")) {
          throw new Error(
            `Storage bucket '${bucket}' not found. Please contact the administrator.`
          );
        }

        if (error.message?.includes("row-level security")) {
          throw new Error(
            "You don't have permission to upload files. Please check your account permissions."
          );
        }

        throw new Error(
          `Upload failed: ${error.message || JSON.stringify(error)}`
        );
      }

      if (!data || !data.path) {
        throw new Error("Upload succeeded but no path was returned");
      }

      // Return the path to the file
      return `${bucket}/${data.path}`;
    } catch (error: any) {
      console.error("Upload failed:", error);
      throw new Error(
        `Upload failed: ${error.message || JSON.stringify(error)}`
      );
    }
  },

  /**
   * Get a public URL for a file
   * @param path The file path
   * @returns The public URL for the file
   */
  getPublicUrl(path: string): string {
    const supabase = createClient();
    const { data } = supabase.storage
      .from(path.split("/")[0])
      .getPublicUrl(path.split("/").slice(1).join("/"));
    return data.publicUrl;
  },

  /**
   * Upload a course thumbnail image
   * @param file The image file to upload
   * @returns The URL path of the uploaded thumbnail
   */
  async uploadCourseThumbnail(file: File): Promise<string> {
    try {
      return await this.uploadFile(file, STORAGE_BUCKETS.COURSES, "thumbnails");
    } catch (error: any) {
      console.error("Error uploading course thumbnail:", error);
      throw new Error(
        `Thumbnail upload failed: ${error.message || JSON.stringify(error)}`
      );
    }
  },

  /**
   * Upload a video file
   * @param file The video file to upload
   * @param courseId The ID of the course this video belongs to
   * @returns The URL path of the uploaded video
   */
  async uploadVideo(file: File, courseId: string): Promise<string> {
    try {
      if (!courseId) {
        throw new Error("Course ID is required for video upload");
      }

      return await this.uploadFile(file, STORAGE_BUCKETS.VIDEOS, courseId);
    } catch (error: any) {
      console.error("Error uploading video:", error);
      throw new Error(
        `Video upload failed: ${error.message || JSON.stringify(error)}`
      );
    }
  },

  /**
   * Generate a video thumbnail from the first frame (not implemented yet)
   * In production this would extract the first frame or use a thumbnail generator
   * @param videoFile The video file
   * @param courseId The course ID
   * @returns The URL path of the generated thumbnail
   */
  async generateVideoThumbnail(
    videoFile: File,
    courseId: string
  ): Promise<string> {
    // In a real application, this would extract the first frame
    // or generate a proper thumbnail

    // For now, we'll just return a fixed path
    return `${STORAGE_BUCKETS.VIDEOS}/${courseId}/thumbnails/default-thumbnail.jpg`;
  },
};
