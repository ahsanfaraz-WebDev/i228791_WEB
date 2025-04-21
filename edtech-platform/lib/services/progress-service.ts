import { createClient } from "@/lib/supabase/client";
import { Progress } from "./course-service";

/**
 * Enhanced service specifically for handling video progress
 * with improved reliability and error handling
 */
export const ProgressService = {
  /**
   * Update the progress for a video
   */
  async updateProgress(
    enrollmentId: string,
    videoId: string,
    watchedSeconds: number,
    completed: boolean
  ): Promise<Progress | null> {
    try {
      if (!enrollmentId || !videoId) {
        console.error("Invalid enrollment or video ID provided");
        throw new Error("Missing required progress data");
      }

      // Convert to integer since the database column expects an integer
      const watchedSecondsInteger = Math.floor(watchedSeconds);

      const supabase = createClient();

      // Format data for insert/update
      const progressData = {
        watched_seconds: watchedSecondsInteger, // Convert to integer
        completed,
        last_watched_at: new Date().toISOString(),
      };

      // Try with upsert pattern which is more reliable
      const { data, error } = await supabase
        .from("progress")
        .upsert(
          {
            enrollment_id: enrollmentId,
            video_id: videoId,
            ...progressData,
          },
          {
            onConflict: "enrollment_id,video_id",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        // Better error logging with full details for debugging
        console.error(
          `Progress upsert error for enrollment ${enrollmentId} and video ${videoId}:`,
          JSON.stringify(error)
        );

        // If upsert fails, try the two-step approach as fallback
        return await this.fallbackUpdateProgress(
          enrollmentId,
          videoId,
          watchedSecondsInteger, // Pass the integer value
          completed
        );
      }

      return data as Progress;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Progress service error: ${errorMessage}`);
      return null;
    }
  },

  /**
   * Fallback method that uses a two-step check-then-update/insert approach
   * when the upsert operation fails
   */
  async fallbackUpdateProgress(
    enrollmentId: string,
    videoId: string,
    watchedSeconds: number,
    completed: boolean
  ): Promise<Progress | null> {
    try {
      console.log("Using fallback progress update method");
      const supabase = createClient();

      // Check if record exists
      const { data: existingProgress, error: checkError } = await supabase
        .from("progress")
        .select()
        .eq("enrollment_id", enrollmentId)
        .eq("video_id", videoId)
        .maybeSingle();

      if (checkError) {
        console.error(`Fallback check error: ${JSON.stringify(checkError)}`);
        return null;
      }

      // Progress data to update/insert
      const progressData = {
        watched_seconds: watchedSeconds,
        completed,
        last_watched_at: new Date().toISOString(),
      };

      let result;

      if (existingProgress) {
        // Update existing record
        const { data, error } = await supabase
          .from("progress")
          .update(progressData)
          .eq("id", existingProgress.id)
          .select()
          .single();

        if (error) {
          console.error(`Fallback update error: ${JSON.stringify(error)}`);
          return null;
        }

        result = data;
      } else {
        // Insert new record
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
          console.error(`Fallback insert error: ${JSON.stringify(error)}`);
          return null;
        }

        result = data;
      }

      return result as Progress;
    } catch (err) {
      console.error(`Fallback progress update failed: ${err}`);
      return null;
    }
  },

  /**
   * Get progress for a specific video
   */
  async getVideoProgress(
    enrollmentId: string,
    videoId: string
  ): Promise<Progress | null> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("progress")
        .select()
        .eq("enrollment_id", enrollmentId)
        .eq("video_id", videoId)
        .maybeSingle();

      if (error) {
        console.error(
          `Error fetching video progress: ${JSON.stringify(error)}`
        );
        return null;
      }

      return data as Progress;
    } catch (err) {
      console.error(`Error in getVideoProgress: ${err}`);
      return null;
    }
  },

  /**
   * Get all progress records for an enrollment
   */
  async getAllProgress(enrollmentId: string): Promise<Progress[]> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("progress")
        .select()
        .eq("enrollment_id", enrollmentId);

      if (error) {
        console.error(`Error fetching all progress: ${JSON.stringify(error)}`);
        return [];
      }

      return data as Progress[];
    } catch (err) {
      console.error(`Error in getAllProgress: ${err}`);
      return [];
    }
  },
};
