"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { StudentModel } from "./student-model"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom top",
          toggleActions: "play none none reverse",
        },
      })

      tl.from(headingRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          textRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .from(
          buttonsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.3",
        )
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-6">
            <h1 ref={headingRef} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Transform Your Learning Experience with <span className="text-emerald-600">EduSphere</span>
            </h1>
            <p ref={textRef} className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-[600px]">
              Empower your educational journey with AI-enhanced video content, real-time interaction, and a seamless
              learning experience.
            </p>
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[500px] w-full">
            <StudentModel />
          </div>
        </div>
      </div>
    </section>
  )
}
