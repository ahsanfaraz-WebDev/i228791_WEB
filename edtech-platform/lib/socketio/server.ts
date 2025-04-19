import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export const initSocketServer = async (
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) => {
  // Check if socket.io server is already initialized
  if (res.socket.server.io) {
    console.log("Socket.io server already running");
    return res.socket.server.io;
  }

  // Initialize socket.io server
  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Store the socket.io server instance
  res.socket.server.io = io;

  console.log("Socket.io server initialized");

  // Set up authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      // Verify the token using Supabase
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new Error("Authentication error: Invalid token"));
      }

      // Attach the user to the socket
      socket.data.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  // Set up connection event
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a course room
    socket.on("join-course", async (courseId) => {
      try {
        const user = socket.data.user;

        // Verify that the user is enrolled in the course or is the tutor
        const supabase = createClient();
        const { data: isTutor } = await supabase
          .from("courses")
          .select("tutor_id")
          .eq("id", courseId)
          .eq("tutor_id", user.id)
          .maybeSingle();

        if (!isTutor) {
          const { data: isEnrolled } = await supabase
            .from("enrollments")
            .select("id")
            .eq("course_id", courseId)
            .eq("student_id", user.id)
            .maybeSingle();

          if (!isEnrolled) {
            socket.emit("error", "You are not enrolled in this course");
            return;
          }
        }

        // Join the room
        socket.join(`course:${courseId}`);
        socket.emit("joined", { courseId });
        console.log(`User ${user.id} joined course ${courseId}`);

        // Notify others
        socket.to(`course:${courseId}`).emit("user-joined", {
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error joining course room:", error);
        socket.emit("error", "Failed to join course chat");
      }
    });

    // Leave a course room
    socket.on("leave-course", (courseId) => {
      socket.leave(`course:${courseId}`);
      console.log(`Socket ${socket.id} left course ${courseId}`);
    });

    // Handle new messages
    socket.on("message", async (data) => {
      try {
        const { courseId, content, replyTo } = data;
        const user = socket.data.user;

        if (!courseId || !content) {
          socket.emit("error", "Missing required fields");
          return;
        }

        // Store message in database
        const supabase = createClient();
        const { data: message, error } = await supabase
          .from("messages")
          .insert({
            course_id: courseId,
            user_id: user.id,
            content,
            reply_to: replyTo || null,
          })
          .select("*, user:profiles(id, full_name, avatar_url, role)")
          .single();

        if (error) {
          throw error;
        }

        // Broadcast to all users in the course room
        io.to(`course:${courseId}`).emit("new-message", message);
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    // Handle typing events
    socket.on("typing", (data) => {
      const { courseId, isTyping } = data;
      const user = socket.data.user;

      // Broadcast typing status to everyone except sender
      socket.to(`course:${courseId}`).emit("user-typing", {
        userId: user.id,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
