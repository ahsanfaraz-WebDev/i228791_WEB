"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ChatService, type Message } from "@/lib/services/chat-service";
import useSocket from "@/lib/hooks/useSocket";

interface ChatInterfaceProps {
  courseId: string | number;
}

export function ChatInterface({ courseId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    connect,
    joinCourse,
    isConnected,
    isDisabled,
    error: socketConnectionError,
    on,
    off,
    sendMessage: socketSendMessage,
    sendTyping,
  } = useSocket({ autoConnect: false }); // Manual connection control

  // Track socket connection errors and set fallback mode if needed
  useEffect(() => {
    if (isDisabled) {
      console.log("Socket.IO is disabled by configuration");
      setSocketError("Socket.IO is disabled");
      setUsingFallback(true);
      setConnectionAttempted(true);
    } else if (socketConnectionError) {
      console.warn("Socket connection error:", socketConnectionError);
      setSocketError(socketConnectionError);
      setUsingFallback(true); // Always use fallback mode on errors
    } else if (isConnected) {
      setSocketError(null);
      setUsingFallback(false); // Only disable fallback when actually connected
    }
  }, [socketConnectionError, isConnected, isDisabled]);

  // Initialize state with local messages if they exist
  useEffect(() => {
    const localMessages = localStorage.getItem(`course-messages-${courseId}`);
    if (localMessages) {
      try {
        const parsedMessages = JSON.parse(localMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing local messages:", error);
      }
    }
  }, [courseId]);

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const courseMessages = await ChatService.getCourseMessages(
          courseId.toString()
        );
        setMessages(courseMessages);

        // Cache messages locally
        localStorage.setItem(
          `course-messages-${courseId}`,
          JSON.stringify(courseMessages)
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [courseId]);

  // Set up Socket.IO connection with improved error handling
  useEffect(() => {
    if (!user || isDisabled) {
      // Skip Socket.IO setup if it's disabled
      if (isDisabled) {
        setConnectionAttempted(true);
        setUsingFallback(true);
      }
      return;
    }

    const connectToSocket = async () => {
      try {
        // Try to connect, but also set a shorter timeout
        console.log("Attempting to connect to socket");
        connect();
        setConnectionAttempted(true);

        // Set a timeout to fall back to REST API if connection takes too long
        const timeoutId = setTimeout(() => {
          if (!isConnected) {
            console.warn("Socket connection timeout, falling back to REST API");
            setUsingFallback(true);
            setSocketError("Connection timeout, using API fallback");
          }
        }, 3000); // 3 second timeout for initial connection (reduced from 5s)

        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error("Failed to connect to socket:", error);
        setUsingFallback(true);
      }
    };

    connectToSocket();

    // Cleanup function
    return () => {
      // No additional cleanup needed here
    };
  }, [user, connect, isConnected, isDisabled]);

  // Join course room and listen for events when connection is established
  useEffect(() => {
    if (!user || !isConnected || isDisabled) return;

    console.log("Joining course room:", courseId.toString());

    try {
      joinCourse(courseId.toString());

      // Listen for new messages
      on("new-message", (message: Message) => {
        console.log("Received new message via socket:", message);
        setMessages((prevMessages) => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some((m) => m.id === message.id);
          if (exists) {
            return prevMessages;
          }

          // Update local storage cache with new message
          const updatedMessages = [...prevMessages, message];
          localStorage.setItem(
            `course-messages-${courseId}`,
            JSON.stringify(updatedMessages)
          );

          return updatedMessages;
        });
      });

      // Listen for errors
      on("error", (errorMessage: string) => {
        console.error("Socket error event:", errorMessage);
        setSocketError(errorMessage);
        if (
          errorMessage.includes("Authentication") ||
          errorMessage.includes("not enrolled")
        ) {
          setUsingFallback(true);
        }
      });

      // Listen for typing events
      on("user-typing", (data: { userId: string; isTyping: boolean }) => {
        if (data.userId !== user.id) {
          setIsTyping(data.isTyping);
        }
      });
    } catch (error) {
      console.error("Error setting up socket events:", error);
      setUsingFallback(true);
    }

    return () => {
      // Clean up event listeners
      off("new-message");
      off("user-typing");
      off("error");
    };
  }, [user, isConnected, courseId, joinCourse, on, off, isDisabled]);

  // Subscribe to new messages with Supabase (backup for Socket.IO)
  useEffect(() => {
    // Always subscribe to Supabase for reliability
    const unsubscribe = ChatService.subscribeToMessages(
      courseId.toString(),
      (newMessage) => {
        console.log("Received new message via Supabase:", newMessage);
        setMessages((prevMessages) => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some((m) => m.id === newMessage.id);
          if (exists) {
            return prevMessages;
          }

          // Update local storage cache with new message
          const updatedMessages = [...prevMessages, newMessage];
          localStorage.setItem(
            `course-messages-${courseId}`,
            JSON.stringify(updatedMessages)
          );

          return updatedMessages;
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [courseId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle typing status
  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);

      // Send typing status if connected
      if (isConnected && !isDisabled) {
        sendTyping(courseId.toString(), e.target.value.length > 0);
      }
    },
    [courseId, isConnected, sendTyping, isDisabled]
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    setIsLoading(true);

    // Add optimistic message immediately for better UX
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      course_id: courseId.toString(),
      user_id: user.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      user: {
        id: user.id,
        full_name: user.user_metadata?.full_name || "You",
        avatar_url: user.user_metadata?.avatar_url || "",
        role: user.user_metadata?.role || "student",
      },
    };

    // Add optimistic message to UI
    setMessages((prev) => [...prev, optimisticMessage]);
    const messageContent = newMessage.trim();
    setNewMessage("");

    // Stop typing indicator
    if (isConnected && !isDisabled) {
      sendTyping(courseId.toString(), false);
    }

    try {
      let socketSuccess = false;

      // Only try Socket.IO if we're not in fallback mode and not disabled
      if (!usingFallback && isConnected && !isDisabled) {
        // Try to send via Socket.IO first
        socketSuccess = socketSendMessage(courseId.toString(), messageContent);
        console.log("Socket message sent:", socketSuccess);
      }

      // If Socket.IO fails, isn't connected, or we're in fallback mode, use direct API call
      if (!socketSuccess) {
        console.log("Using fallback method to send message");
        const sentMessage = await ChatService.sendMessage(
          courseId.toString(),
          user.id,
          messageContent
        );

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) => (msg.id === optimisticId ? sentMessage : msg))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Connection status indicators */}
      {(connectionAttempted || isDisabled) && (
        <div
          className={`px-3 py-2 text-sm flex items-center gap-2 ${
            usingFallback || isDisabled
              ? "bg-amber-50 border-amber-200 border text-amber-800"
              : isConnected
              ? "bg-emerald-50 border-emerald-200 border text-emerald-800"
              : "bg-gray-50 border-gray-200 border text-gray-800"
          }`}
        >
          {isConnected && !usingFallback && !isDisabled ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Real-time chat connected</span>
            </>
          ) : usingFallback || isDisabled ? (
            <>
              <WifiOff className="h-4 w-4" />
              <span>
                {isDisabled
                  ? "Real-time chat is disabled. Using standard messaging."
                  : "Using API fallback for chat. Some real-time features may be limited."}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>Connecting to chat...</span>
            </>
          )}
        </div>
      )}

      {/* Error message if there's a socket error but we're not in fallback mode */}
      {socketError && !usingFallback && !isDisabled && (
        <div className="bg-amber-50 border-amber-200 border p-2 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Socket connection issue: {socketError}</span>
        </div>
      )}

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.user_id === user?.id ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`relative h-8 w-8 rounded-full overflow-hidden ${
                    message.user_id === user?.id ? "ml-2" : "mr-2"
                  }`}
                >
                  <Image
                    src={
                      message.user?.avatar_url ||
                      "/placeholder.svg?height=40&width=40"
                    }
                    alt={message.user?.full_name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.user_id === user?.id
                      ? "bg-emerald-600 text-white"
                      : message.user?.role === "tutor"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">
                      {message.user?.full_name || "Unknown User"}
                      {message.user?.role === "tutor" && (
                        <span className="ml-1 text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">
                          Tutor
                        </span>
                      )}
                    </span>
                    <span className="text-xs opacity-70 ml-2">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type your message..."
          className="flex-1"
          disabled={!user || isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={!user || isLoading || !newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
