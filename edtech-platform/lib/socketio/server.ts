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

  try {
    // Initialize socket.io server with improved configuration
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*", // In production, you might want to restrict this
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Authorization", "Content-Type"],
      },
      // Set a longer ping timeout and interval for more stability
      pingTimeout: 60000,
      pingInterval: 25000,
      // Transports configuration
      transports: ["websocket", "polling"],
      // Set a higher connection timeout
      connectTimeout: 30000,
    });

    // Store the socket.io server instance
    res.socket.server.io = io;

    console.log("Socket.io server initialized");

    // Set up authentication middleware with better error handling
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
          console.error(
            "Socket auth error:",
            error?.message || "Invalid token"
          );
          return next(new Error("Authentication error: Invalid token"));
        }

        // Attach the user to the socket
        socket.data.user = user;
        next();
      } catch (error: any) {
        console.error("Socket authentication error:", error?.message || error);
        next(
          new Error(
            `Authentication error: ${error?.message || "Unknown error"}`
          )
        );
      }
    });

    // Set up connection event with improved error handling
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Handle socket errors
      socket.on("error", (err) => {
        console.error(`Socket ${socket.id} error:`, err);
      });

      // Join a course room with try-catch block
      socket.on("join-course", async (courseId) => {
        try {
          if (!socket.data?.user) {
            socket.emit("error", "Authentication required");
            return;
          }

          const user = socket.data.user;

          // Verify that the user is enrolled in the course or is the tutor
          const supabase = createClient();
          const { data: isTutor, error: tutorError } = await supabase
            .from("courses")
            .select("tutor_id")
            .eq("id", courseId)
            .eq("tutor_id", user.id)
            .maybeSingle();

          if (tutorError) {
            console.error("Error checking tutor status:", tutorError);
            socket.emit("error", "Error verifying course access");
            return;
          }

          if (!isTutor) {
            const { data: isEnrolled, error: enrolledError } = await supabase
              .from("enrollments")
              .select("id")
              .eq("course_id", courseId)
              .eq("student_id", user.id)
              .maybeSingle();

            if (enrolledError) {
              console.error("Error checking enrollment status:", enrolledError);
              socket.emit("error", "Error verifying course enrollment");
              return;
            }

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
        } catch (error: any) {
          console.error("Error joining course room:", error?.message || error);
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
  } catch (error: any) {
    console.error(
      "Error initializing Socket.IO server:",
      error?.message || error
    );
    throw error;
  }
};
