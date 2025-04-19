import { createClient } from "@/lib/supabase/client"

export type Message = {
  id: string
  course_id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url: string
    role: string
  }
}

export const ChatService = {
  // Get messages for a course
  async getCourseMessages(courseId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, role)
      `)
      .eq("course_id", courseId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error(`Error fetching messages for course ${courseId}:`, error)
      throw error
    }

    return data as Message[]
  },

  // Send a message
  async sendMessage(courseId: string, userId: string, content: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("messages")
      .insert({
        course_id: courseId,
        user_id: userId,
        content,
      })
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, role)
      `)
      .single()

    if (error) {
      console.error(`Error sending message for course ${courseId}:`, error)
      throw error
    }

    return data as Message
  },

  // Subscribe to new messages
  subscribeToMessages(courseId: string, callback: (message: Message) => void) {
    const supabase = createClient()

    const subscription = supabase
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
          // Fetch the complete message with user data
          const { data, error } = await supabase
            .from("messages")
            .select(`
              *,
              user:profiles(id, full_name, avatar_url, role)
            `)
            .eq("id", payload.new.id)
            .single()

          if (!error && data) {
            callback(data as Message)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  },
}
