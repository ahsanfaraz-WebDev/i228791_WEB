"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Video,
  Users,
  BookOpen,
  MessageSquare,
  Zap,
  Award,
  Loader2,
} from "lucide-react";

// Brand colors for consistent theme across app - matches hero section
const BRAND_COLORS = {
  primary: "#3B82F6", // blue-500
  secondary: "#6366F1", // indigo-500
  accent: "#8B5CF6", // violet-500
  light: "#F8FAFC", // slate-50
  dark: "#1E293B", // slate-800
  text: "#0F172A", // slate-900
  textLight: "#94A3B8", // slate-400
};

interface Feature {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  display_order: number;
}

// Define feature colors for visual interest
const featureColors = {
  video: {
    bg: "from-blue-500/20 to-blue-500/5",
    text: "text-blue-500",
    accent: "bg-blue-500/10",
    color: BRAND_COLORS.primary,
  },
  users: {
    bg: "from-violet-500/20 to-violet-500/5",
    text: "text-violet-500",
    accent: "bg-violet-500/10",
    color: BRAND_COLORS.accent,
  },
  book: {
    bg: "from-emerald-500/20 to-emerald-500/5",
    text: "text-emerald-500",
    accent: "bg-emerald-500/10",
    color: "#10B981", // emerald-500
  },
  message: {
    bg: "from-amber-500/20 to-amber-500/5",
    text: "text-amber-500",
    accent: "bg-amber-500/10",
    color: "#F59E0B", // amber-500
  },
  zap: {
    bg: "from-indigo-500/20 to-indigo-500/5",
    text: "text-indigo-500",
    accent: "bg-indigo-500/10",
    color: BRAND_COLORS.secondary,
  },
  award: {
    bg: "from-purple-500/20 to-purple-500/5",
    text: "text-purple-500",
    accent: "bg-purple-500/10",
    color: "#A855F7", // purple-500
  },
};

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/content?type=features");
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching features:", data.error);
          return;
        }

        setFeatures(data.data);
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Header animation
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }

      // Cards animation
      if (cardsRef.current && !isLoading) {
        const cards = cardsRef.current.querySelectorAll(".feature-card");

        gsap.fromTo(
          cards,
          {
            y: 60,
            opacity: 0,
            scale: 0.9,
            rotationX: 10,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }
  }, [isLoading, features]);

  // Function to render the correct icon based on icon_name
  const renderIcon = (iconName: string) => {
    const colorClass =
      featureColors[iconName as keyof typeof featureColors]?.text ||
      "text-blue-500";

    switch (iconName) {
      case "video":
        return <Video className={`h-10 w-10 ${colorClass}`} />;
      case "users":
        return <Users className={`h-10 w-10 ${colorClass}`} />;
      case "book":
        return <BookOpen className={`h-10 w-10 ${colorClass}`} />;
      case "message":
        return <MessageSquare className={`h-10 w-10 ${colorClass}`} />;
      case "zap":
        return <Zap className={`h-10 w-10 ${colorClass}`} />;
      case "award":
        return <Award className={`h-10 w-10 ${colorClass}`} />;
      default:
        return <BookOpen className={`h-10 w-10 ${colorClass}`} />;
    }
  };

  // Fallback features in case the API call fails
  const fallbackFeatures = [
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
  ];

  const displayFeatures = features.length > 0 ? features : fallbackFeatures;

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-slate-50 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden relative"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div ref={headerRef} className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
            Powerful Features for Modern Learning
          </h2>
          <p className="mt-4 text-slate-700 dark:text-slate-300 md:text-xl max-w-[700px] mx-auto">
            Our platform combines cutting-edge technology with intuitive design
            to create the ultimate educational experience.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayFeatures.map((feature) => {
              const colorScheme =
                featureColors[
                  feature.icon_name as keyof typeof featureColors
                ] || featureColors.book;
              const isHovered = hoveredCard === feature.id;

              return (
                <Card
                  key={feature.id}
                  className={`feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-500 relative overflow-hidden 
                              ${isHovered ? "scale-[1.02]" : "scale-100"}`}
                  onMouseEnter={() => setHoveredCard(feature.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    borderRadius: "16px",
                  }}
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      colorScheme.bg
                    } opacity-${
                      isHovered ? "100" : "70"
                    } transition-opacity duration-300`}
                  ></div>

                  {/* Content */}
                  <CardHeader className="relative z-10">
                    <div
                      className={`p-3 w-fit rounded-xl ${
                        colorScheme.accent
                      } mb-5 transition-all duration-300 ${
                        isHovered ? "scale-110" : "scale-100"
                      }`}
                    >
                      {renderIcon(feature.icon_name)}
                    </div>
                    <CardTitle
                      className={`text-xl ${colorScheme.text} transition-colors duration-300`}
                    >
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base text-slate-700 dark:text-slate-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>

                  {/* Border accent for hover effect */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 ${
                      isHovered ? "w-full" : "w-0"
                    } transition-all duration-500 ease-out`}
                    style={{
                      backgroundColor: colorScheme.color,
                    }}
                  ></div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
