"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (testimonialsRef.current) {
        const testimonials = testimonialsRef.current.querySelectorAll(".testimonial-card")

        gsap.from(testimonials, {
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Math Tutor",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "EduSphere has transformed how I teach. The AI transcription feature saves me hours of work, and the real-time chat keeps my students engaged like never before.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Computer Science Student",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "As a student with a hearing impairment, the automatic transcripts have been a game-changer for me. I can now fully participate in all my courses without missing anything.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Language Arts Professor",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "The course management tools are intuitive and powerful. I've been able to create more engaging content and track my students' progress more effectively.",
      rating: 4,
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-slate-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl max-w-[700px] mx-auto">
            Hear from educators and learners who have transformed their teaching and learning experience with EduSphere.
          </p>
        </div>
        <div ref={testimonialsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="testimonial-card">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {Array(testimonial.rating)
                    .fill(null)
                    .map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current text-yellow-500" />
                    ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">"{testimonial.content}"</p>
              </CardContent>
              <CardFooter className="border-t pt-4 flex items-center">
                <div className="relative h-10 w-10 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
