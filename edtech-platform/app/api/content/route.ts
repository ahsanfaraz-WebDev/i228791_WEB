import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Fallback data for when the database tables don't exist
const fallbackData = {
  features: [
    {
      id: "1",
      icon_name: "video",
      title: "AI-Enhanced Video Content",
      description:
        "Automatically generate transcripts for all your course videos, making content more accessible and searchable.",
      display_order: 1,
    },
    {
      id: "2",
      icon_name: "users",
      title: "Real-Time Interaction",
      description:
        "Connect with tutors and peers through course-specific chat rooms for immediate feedback and collaboration.",
      display_order: 2,
    },
    {
      id: "3",
      icon_name: "book",
      title: "Comprehensive Course Management",
      description:
        "Create, edit, and organize your courses with an intuitive dashboard for both tutors and students.",
      display_order: 3,
    },
    {
      id: "4",
      icon_name: "message",
      title: "Live Chat Support",
      description:
        "Get help when you need it with our real-time messaging system integrated into every course.",
      display_order: 4,
    },
    {
      id: "5",
      icon_name: "zap",
      title: "Seamless Learning Experience",
      description:
        "Enjoy a fluid, responsive interface designed to enhance your educational journey.",
      display_order: 5,
    },
    {
      id: "6",
      icon_name: "award",
      title: "Certification & Achievement",
      description:
        "Track your progress and earn certificates upon course completion to showcase your new skills.",
      display_order: 6,
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Math Tutor",
      image_url: "/images/testimonials/sarah-johnson.jpg",
      content:
        "EduSphere has transformed how I teach. The AI transcription feature saves me hours of work, and the real-time chat keeps my students engaged like never before.",
      rating: 5,
      display_order: 1,
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Computer Science Student",
      image_url: "/images/testimonials/michael-chen.jpg",
      content:
        "As a student with a hearing impairment, the automatic transcripts have been a game-changer for me. I can now fully participate in all my courses without missing anything.",
      rating: 5,
      display_order: 2,
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "Language Arts Professor",
      image_url: "/images/testimonials/emily-rodriguez.jpg",
      content:
        "The course management tools are intuitive and powerful. I've been able to create more engaging content and track my students' progress more effectively.",
      rating: 4,
      display_order: 3,
    },
  ],
};

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("type");

    if (!contentType) {
      return NextResponse.json(
        { error: "Content type parameter is required" },
        { status: 400 }
      );
    }

    let data;

    if (contentType === "features") {
      const { data: features, error } = await supabase
        .from("features")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("Error fetching features from database:", error);
        console.log("Using fallback features data");
        data = fallbackData.features;
      } else {
        data = features;
      }
    } else if (contentType === "testimonials") {
      const { data: testimonials, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("Error fetching testimonials from database:", error);
        console.log("Using fallback testimonials data");
        data = fallbackData.testimonials;
      } else {
        data = testimonials;
      }
    } else {
      return NextResponse.json(
        { error: `Invalid content type: ${contentType}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching content:", error);

    // Return fallback data instead of an error
    const contentType = new URL(req.url).searchParams.get("type");
    if (contentType === "features") {
      return NextResponse.json({ data: fallbackData.features });
    } else if (contentType === "testimonials") {
      return NextResponse.json({ data: fallbackData.testimonials });
    }

    return NextResponse.json(
      { error: "Failed to fetch content data" },
      { status: 500 }
    );
  }
}
