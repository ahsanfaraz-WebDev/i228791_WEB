import { createClient } from "@/lib/supabase/client";

export type Message = {
  id: string;
  course_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
  };
};

// Helper function to retry failed API calls
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.warn(
        `Operation failed, retrying (${attempt + 1}/${maxRetries})`,
        error
      );

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * (attempt + 1))
        );
      }
    }
  }

  // All retries failed, throw the last error
  throw lastError;
};

export const ChatService = {
  // Get messages for a course
  async getCourseMessages(courseId: string) {
    return withRetry(async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          user:profiles(id, full_name, avatar_url, role)
        `
        )
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(`Error fetching messages for course ${courseId}:`, error);
        throw error;
      }

      return data as Message[];
    });
  },

  // Send a message
  async sendMessage(courseId: string, userId: string, content: string) {
    return withRetry(async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("messages")
        .insert({
          course_id: courseId,
          user_id: userId,
          content,
        })
        .select(
          `
          *,
          user:profiles(id, full_name, avatar_url, role)
        `
        )
        .single();

      if (error) {
        console.error(`Error sending message for course ${courseId}:`, error);
        throw error;
      }

      return data as Message;
    });
  },

  // Subscribe to new messages with improved error handling
  subscribeToMessages(courseId: string, callback: (message: Message) => void) {
    const supabase = createClient();
    let subscription;
    let isSubscribed = false;

    // Define a function to create and manage the subscription
    const setupSubscription = () => {
      try {
        // Remove any existing subscription first
        if (subscription) {
          try {
            supabase.removeChannel(subscription);
          } catch (e) {
            console.warn("Error removing previous channel:", e);
          }
        }

        // Create a new subscription
        subscription = supabase
          .channel(`messages:${courseId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `course_id=eq.${courseId}`,
            },
            async (payload) => {
              try {
                // Fetch the complete message with user data
                const { data, error } = await supabase
                  .from("messages")
                  .select(
                    `
                    *,
                    user:profiles(id, full_name, avatar_url, role)
                  `
                  )
                  .eq("id", payload.new.id)
                  .single();

                if (!error && data) {
                  callback(data as Message);
                } else if (error) {
                  console.error("Error fetching complete message:", error);
                }
              } catch (error) {
                console.error("Error processing subscription message:", error);
              }
            }
          )
          .subscribe((status) => {
            isSubscribed = status === "SUBSCRIBED";
            console.log(
              `Supabase subscription status for course ${courseId}:`,
              status
            );

            // Retry if subscription fails
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              console.warn(
                `Supabase subscription error for course ${courseId}, retrying...`
              );
              // Retry with a delay
              setTimeout(setupSubscription, 2000);
            }
          });
      } catch (error) {
        console.error("Error setting up Supabase subscription:", error);
        // Retry on error
        setTimeout(setupSubscription, 3000);
      }
    };

    // Initial setup
    setupSubscription();

    // Return cleanup function
    return () => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (e) {
          console.warn("Error removing channel during cleanup:", e);
        }
      }
    };
  },
};
