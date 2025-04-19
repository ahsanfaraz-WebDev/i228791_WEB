"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Users, BookOpen, MessageSquare, Zap, Award } from "lucide-react"

export function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".feature-card")

        gsap.from(cards, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }
  }, [])

  const features = [
    {
      icon: <Video className="h-10 w-10 text-emerald-600" />,
      title: "AI-Enhanced Video Content",
      description:
        "Automatically generate transcripts for all your course videos, making content more accessible and searchable.",
    },
    {
      icon: <Users className="h-10 w-10 text-emerald-600" />,
      title: "Real-Time Interaction",
      description:
        "Connect with tutors and peers through course-specific chat rooms for immediate feedback and collaboration.",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-emerald-600" />,
      title: "Comprehensive Course Management",
      description: "Create, edit, and organize your courses with an intuitive dashboard for both tutors and students.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-emerald-600" />,
      title: "Live Chat Support",
      description: "Get help when you need it with our real-time messaging system integrated into every course.",
    },
    {
      icon: <Zap className="h-10 w-10 text-emerald-600" />,
      title: "Seamless Learning Experience",
      description: "Enjoy a fluid, responsive interface designed to enhance your educational journey.",
    },
    {
      icon: <Award className="h-10 w-10 text-emerald-600" />,
      title: "Certification & Achievement",
      description: "Track your progress and earn certificates upon course completion to showcase your new skills.",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features for Modern Learning
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl max-w-[700px] mx-auto">
            Our platform combines cutting-edge technology with intuitive design to create the ultimate educational
            experience.
          </p>
        </div>
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card border-2 border-muted hover:border-emerald-200 transition-all duration-300"
            >
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950/50 mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
