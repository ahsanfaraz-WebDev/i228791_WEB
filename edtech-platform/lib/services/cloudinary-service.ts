import { v4 as uuidv4 } from "uuid";

// Define upload preset types
export type UploadPreset =
  | "course_thumbnails"
  | "course_videos"
  | "user_avatars";

export const CloudinaryService = {
  /**
   * Upload a file to Cloudinary
   * @param file The file to upload
   * @param preset The upload preset to use (configured in Cloudinary)
   * @param folder Optional folder path
   * @returns The URL of the uploaded file
   */
  async uploadFile(
    file: File,
    preset: UploadPreset,
    folder?: string
  ): Promise<string> {
    try {
      if (!file) {
        throw new Error("No file provided for upload");
      }

      // Prepare the form data for the upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);

      // Add folder if provided
      if (folder) {
        formData.append("folder", folder);
      }

      // Add public_id with unique identifier to prevent name collisions
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}`;
      formData.append("public_id", uniqueFileName);

      console.log(
        `Uploading ${file.name} (${file.size} bytes) to Cloudinary using preset ${preset}`
      );

      // Make the upload request to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Cloudinary upload error:", error);
        throw new Error(
          `Upload failed: ${error.message || JSON.stringify(error)}`
        );
      }

      const data = await response.json();

      // Return the secure URL of the uploaded asset
      return data.secure_url;
    } catch (error: any) {
      console.error("Cloudinary upload failed:", error);
      throw new Error(
        `Upload failed: ${error.message || JSON.stringify(error)}`
      );
    }
  },

  /**
   * Upload a course thumbnail image
   * @param file The image file to upload
   * @param courseId Optional course ID for organizing uploads
   * @returns The URL of the uploaded thumbnail
   */
  async uploadCourseThumbnail(file: File, courseId?: string): Promise<string> {
    try {
      const folder = courseId
        ? `courses/${courseId}/thumbnails`
        : "courses/thumbnails";
      return await this.uploadFile(file, "course_thumbnails", folder);
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
   * @returns The URL of the uploaded video
   */
  async uploadVideo(file: File, courseId: string): Promise<string> {
    try {
      if (!courseId) {
        throw new Error("Course ID is required for video upload");
      }

      return await this.uploadFile(
        file,
        "course_videos",
        `courses/${courseId}/videos`
      );
    } catch (error: any) {
      console.error("Error uploading video:", error);
      throw new Error(
        `Video upload failed: ${error.message || JSON.stringify(error)}`
      );
    }
  },

  /**
   * Upload a user avatar
   * @param file The image file to upload
   * @param userId The user's ID
   * @returns The URL of the uploaded avatar
   */
  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    try {
      return await this.uploadFile(file, "user_avatars", `avatars/${userId}`);
    } catch (error: any) {
      console.error("Error uploading user avatar:", error);
      throw new Error(
        `Avatar upload failed: ${error.message || JSON.stringify(error)}`
      );
    }
  },

  /**
   * Generate a video thumbnail from a video URL
   * @param videoUrl The URL of the video
   * @returns The URL of the generated thumbnail
   */
  getVideoThumbnail(videoUrl: string): string {
    // Cloudinary can automatically generate thumbnails from videos
    // Example: https://res.cloudinary.com/demo/video/upload/w_400,h_300,c_pad,b_auto/v1612281135/sample-video.jpg

    // Replace /video/upload/ with /video/upload/w_640,h_360,c_fill,g_auto/so_auto,pg_1/
    return videoUrl.replace(
      "/video/upload/",
      "/video/upload/w_640,h_360,c_fill,g_auto/so_auto,pg_1/"
    );
  },
};
