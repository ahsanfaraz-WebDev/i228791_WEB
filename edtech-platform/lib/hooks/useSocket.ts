"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/components/auth/auth-provider";

// Feature flag to completely disable Socket.IO and use REST API only
// Set to true to skip all Socket.IO connection attempts
const DISABLE_SOCKET_IO = true;

interface UseSocketOptions {
  autoConnect?: boolean;
}

export default function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = false } = options;
  const { user, getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const maxReconnectAttempts = 3;

  // Initialize socket connection
  const initSocket = useCallback(async () => {
    try {
      // Skip Socket.IO entirely if disabled
      if (DISABLE_SOCKET_IO) {
        console.log("Socket.IO connections are disabled. Using REST API only.");
        setError("Socket.IO disabled");
        return;
      }

      if (socketRef.current) {
        // Socket already initialized
        return;
      }

      if (!user) {
        setError("User authentication required");
        return;
      }

      // Get auth token
      const token = await getToken();

      if (!token) {
        setError("Authentication token not available");
        return;
      }

      // Initialize socket connection with more robust configuration
      const socket = io({
        path: "/api/socket",
        autoConnect: false,
        auth: { token },
        // Reduce reconnection attempts to fail faster and fall back to REST
        reconnectionAttempts: maxReconnectAttempts,
        // Start with a shorter reconnection delay
        reconnectionDelay: 500,
        reconnectionDelayMax: 2000,
        // Shorter timeout to fail faster
        timeout: 10000,
        // Try websocket first, then polling as a fallback
        transports: ["websocket", "polling"],
        // Add forceNew to ensure a clean connection
        forceNew: true,
      });

      // Set up event listeners
      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0; // Reset reconnect counter on successful connection
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);

        // Handle disconnection with clean error message
        if (reason === "io server disconnect") {
          // The server has forcefully disconnected the socket
          setError("Server disconnected the connection");
          socket.disconnect();
        } else if (
          reason === "transport close" ||
          reason === "transport error"
        ) {
          setError("Connection closed. Check your network connection.");
        } else if (reason === "ping timeout") {
          setError("Connection timed out. The server is not responding.");
        }
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);

        reconnectAttemptRef.current += 1;
        console.log(
          `Reconnection attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts}`
        );

        // If we've reached max attempts, clean up and set fallback mode
        if (reconnectAttemptRef.current >= maxReconnectAttempts) {
          console.log(
            "Max reconnection attempts reached, falling back to REST API"
          );
          socket.disconnect();
          socketRef.current = null;
        }
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err);
        setError(typeof err === "string" ? err : "An error occurred");
      });

      // Handle connection timeout explicitly
      socket.io.on("reconnect_attempt", (attempt) => {
        console.log(`Socket reconnection attempt: ${attempt}`);
      });

      socket.io.on("reconnect", (attempt) => {
        console.log(`Socket reconnected after ${attempt} attempts`);
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
      });

      socket.io.on("reconnect_error", (err) => {
        console.error("Socket reconnection error:", err);
      });

      socket.io.on("reconnect_failed", () => {
        console.error("Socket reconnection failed after all attempts");
        setError("Failed to reconnect to the server");
        socket.disconnect();
        socketRef.current = null;
      });

      socketRef.current = socket;

      if (autoConnect && !DISABLE_SOCKET_IO) {
        // Add a small delay before connecting to allow the system to stabilize
        setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.connect();
          }
        }, 100);
      }
    } catch (err: any) {
      console.error("Error initializing socket:", err);
      setError(`Failed to initialize socket connection: ${err.message}`);
    }
  }, [user, getToken, autoConnect]);

  // Connect to socket with retry mechanism
  const connect = useCallback(() => {
    // Skip connection if Socket.IO is disabled
    if (DISABLE_SOCKET_IO) {
      return;
    }

    const connectWithRetry = async () => {
      if (!socketRef.current) {
        await initSocket();
        if (socketRef.current) {
          socketRef.current.connect();
        }
      } else if (!socketRef.current.connected) {
        socketRef.current.connect();
      }
    };

    // Try to connect immediately
    connectWithRetry();
  }, [initSocket]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  // Join a course chat room
  const joinCourse = useCallback(
    (courseId: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("join-course", courseId);
      } else {
        setError("Socket not connected");
      }
    },
    [isConnected]
  );

  // Leave a course chat room
  const leaveCourse = useCallback(
    (courseId: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("leave-course", courseId);
      }
    },
    [isConnected]
  );

  // Send a message
  const sendMessage = useCallback(
    (courseId: string, content: string, replyTo?: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("message", { courseId, content, replyTo });
        return true;
      } else {
        setError("Socket not connected");
        return false;
      }
    },
    [isConnected]
  );

  // Send typing status
  const sendTyping = useCallback(
    (courseId: string, isTyping: boolean) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("typing", { courseId, isTyping });
      }
    },
    [isConnected]
  );

  // Subscribe to events
  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
      }
    },
    []
  );

  // Unsubscribe from events
  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    },
    []
  );

  // Initialize socket on component mount if autoConnect is true (and not disabled)
  useEffect(() => {
    if (autoConnect && user && !DISABLE_SOCKET_IO) {
      initSocket().then(() => {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      });
    }

    // Clean up socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [autoConnect, initSocket, user]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    isDisabled: DISABLE_SOCKET_IO,
    connect,
    disconnect,
    joinCourse,
    leaveCourse,
    sendMessage,
    sendTyping,
    on,
    off,
  };
}
