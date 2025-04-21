"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Send, Search, User, ChevronRight } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Fetch user profile to get role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
        }

        // Fetch conversations - This is a placeholder for demo purposes
        // In a real app, you would fetch actual conversations from your database
        const mockConversations = generateMockConversations(
          profile?.role || "student"
        );
        setConversations(mockConversations);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <p>Please log in to view your messages.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          {userRole === "tutor" && (
            <TabsTrigger value="students">Students</TabsTrigger>
          )}
          {userRole === "student" && (
            <TabsTrigger value="tutors">Tutors</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {conversations.length > 0 ? (
            conversations.map((conversation, index) => (
              <ConversationCard
                key={index}
                conversation={conversation}
                userRole={userRole}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {conversations.filter((c) => c.unread).length > 0 ? (
            conversations
              .filter((c) => c.unread)
              .map((conversation, index) => (
                <ConversationCard
                  key={index}
                  conversation={conversation}
                  userRole={userRole}
                />
              ))
          ) : (
            <EmptyState message="No unread messages" />
          )}
        </TabsContent>

        {userRole === "tutor" && (
          <TabsContent value="students" className="space-y-4">
            {conversations.filter((c) => c.type === "student").length > 0 ? (
              conversations
                .filter((c) => c.type === "student")
                .map((conversation, index) => (
                  <ConversationCard
                    key={index}
                    conversation={conversation}
                    userRole={userRole}
                  />
                ))
            ) : (
              <EmptyState message="No student messages" />
            )}
          </TabsContent>
        )}

        {userRole === "student" && (
          <TabsContent value="tutors" className="space-y-4">
            {conversations.filter((c) => c.type === "tutor").length > 0 ? (
              conversations
                .filter((c) => c.type === "tutor")
                .map((conversation, index) => (
                  <ConversationCard
                    key={index}
                    conversation={conversation}
                    userRole={userRole}
                  />
                ))
            ) : (
              <EmptyState message="No tutor messages" />
            )}
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Need more help?</h3>
        <p className="text-muted-foreground mb-4">
          If you have any questions or need support, our team is here to help.
        </p>
        <Button asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}

function ConversationCard({
  conversation,
  userRole,
}: {
  conversation: any;
  userRole: string | null;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (conversation.courseId) {
      router.push(`/dashboard/courses/${conversation.courseId}/chat`);
    } else {
      router.push(`/dashboard/messages/${conversation.id}`);
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        conversation.unread ? "border-l-4 border-l-emerald-500" : ""
      }`}
    >
      <CardContent className="p-4">
        <div
          className="flex items-center gap-4"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={conversation.avatar || "/placeholder.svg?height=40&width=40"}
              alt={conversation.name}
              fill
              className="object-cover"
            />
            {conversation.unread && (
              <div className="absolute top-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="font-medium truncate">{conversation.name}</div>
              <div className="text-xs text-muted-foreground">
                {conversation.time}
              </div>
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {conversation.course && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mr-1">
                  {conversation.course}
                </span>
              )}
              {conversation.lastMessage}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message = "No messages yet" }: { message?: string }) {
  return (
    <div className="text-center py-10 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-medium mb-1">{message}</h3>
      <p className="text-muted-foreground mb-4">
        When you have conversations, they will appear here.
      </p>
    </div>
  );
}

// Helper function to generate mock conversations for demonstration
function generateMockConversations(userRole: string) {
  if (userRole === "tutor") {
    return [
      {
        id: "1",
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "I have a question about the assignment for week 2...",
        time: "2 hours ago",
        unread: true,
        type: "student",
        course: "Web Development",
        courseId: "b9bd0ffc-689f-428e-9f9e-12fba7a016c1",
      },
      {
        id: "2",
        name: "Maya Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "Thank you for the feedback on my project!",
        time: "Yesterday",
        unread: false,
        type: "student",
        course: "UI/UX Design",
        courseId: "b1dc2ece-8707-4ce5-bc14-65eb6aec9c55",
      },
      {
        id: "3",
        name: "Support Team",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "Your latest course has been approved and published.",
        time: "3 days ago",
        unread: false,
        type: "admin",
      },
    ];
  } else {
    return [
      {
        id: "1",
        name: "Prof. Sarah Williams",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage:
          "Here's some additional resources for the topic we discussed...",
        time: "1 hour ago",
        unread: true,
        type: "tutor",
        course: "Web Development",
        courseId: "b9bd0ffc-689f-428e-9f9e-12fba7a016c1",
      },
      {
        id: "2",
        name: "Dr. James Miller",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage:
          "Great job on your last assignment! Let me know if you have questions.",
        time: "Yesterday",
        unread: false,
        type: "tutor",
        course: "Data Science",
        courseId: "b1dc2ece-8707-4ce5-bc14-65eb6aec9c55",
      },
      {
        id: "3",
        name: "Study Group: JavaScript",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "Tom: Does anyone understand how closures work?",
        time: "2 days ago",
        unread: false,
        type: "group",
      },
    ];
  }
}
