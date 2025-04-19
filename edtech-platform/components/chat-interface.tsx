"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ChatService, type Message } from "@/lib/services/chat-service"

interface ChatInterfaceProps {
  courseId: string | number
}

export function ChatInterface({ courseId }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const courseMessages = await ChatService.getCourseMessages(courseId.toString())
        setMessages(courseMessages)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
  }, [courseId])

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = ChatService.subscribeToMessages(courseId.toString(), (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage])
    })

    return () => {
      unsubscribe()
    }
  }, [courseId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    setIsLoading(true)

    try {
      await ChatService.sendMessage(courseId.toString(), user.id, newMessage)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.user_id === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] ${message.user_id === user?.id ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`relative h-8 w-8 rounded-full overflow-hidden ${
                    message.user_id === user?.id ? "ml-2" : "mr-2"
                  }`}
                >
                  <Image
                    src={message.user?.avatar_url || "/placeholder.svg?height=40&width=40"}
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
                        <span className="ml-1 text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">Tutor</span>
                      )}
                    </span>
                    <span className="text-xs opacity-70 ml-2">{formatTime(message.created_at)}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
  )
}
