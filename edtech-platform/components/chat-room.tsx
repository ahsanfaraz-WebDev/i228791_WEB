"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Message {
  _id: string
  userId: string
  userName: string
  userRole: "student" | "teacher"
  message: string
  createdAt: string
}

interface ChatRoomProps {
  courseId: string
  userId: string
}

export default function ChatRoom({ courseId, userId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat?courseId=${courseId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchMessages()

    // In a real implementation, you would set up a WebSocket connection here
    // to receive real-time messages

    // Simulating real-time updates with polling for demo purposes
    const interval = setInterval(fetchMessages, 5000)

    return () => clearInterval(interval)
  }, [courseId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          message: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setNewMessage("")
      fetchMessages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-medium">Course Chat Room</h3>
        <p className="text-sm text-muted-foreground">Chat with instructors and other students</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`flex gap-3 ${msg.userId === userId ? "justify-end" : "justify-start"}`}>
              {msg.userId !== userId && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={msg.userName} />
                  <AvatarFallback>{msg.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.userId === userId
                    ? "bg-primary text-primary-foreground"
                    : msg.userRole === "teacher"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted"
                }`}
              >
                {msg.userId !== userId && (
                  <p className="text-xs font-medium mb-1">
                    {msg.userName} {msg.userRole === "teacher" && "(Instructor)"}
                  </p>
                )}
                <p>{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {msg.userId === userId && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
