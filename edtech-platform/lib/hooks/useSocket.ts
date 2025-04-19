"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/components/auth/auth-provider";

interface UseSocketOptions {
  autoConnect?: boolean;
}

export default function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = false } = options;
  const { user, getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  const initSocket = useCallback(async () => {
    try {
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

      // Initialize socket connection
      const socket = io({
        path: "/api/socket",
        autoConnect: false,
        auth: { token },
      });

      // Set up event listeners
      socket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        setError(null);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err);
        setError(typeof err === "string" ? err : "An error occurred");
      });

      socketRef.current = socket;

      if (autoConnect) {
        socket.connect();
      }
    } catch (err) {
      console.error("Error initializing socket:", err);
      setError("Failed to initialize socket connection");
    }
  }, [user, getToken, autoConnect]);

  // Connect to socket
  const connect = useCallback(() => {
    if (!socketRef.current) {
      initSocket().then(() => {
        socketRef.current?.connect();
      });
    } else if (!socketRef.current.connected) {
      socketRef.current.connect();
    }
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

  // Initialize socket on component mount if autoConnect is true
  useEffect(() => {
    if (autoConnect && user) {
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
