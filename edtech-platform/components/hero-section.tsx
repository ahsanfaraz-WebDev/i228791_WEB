"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Staggered animation sequence for the elements
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (textRef.current && subTextRef.current && buttonContainerRef.current) {
      tl.from(textRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
      })
        .from(
          subTextRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          buttonContainerRef.current.children,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
          },
          "-=0.4"
        );
    }

    // Image container animation
    if (imageContainerRef.current) {
      gsap.from(imageContainerRef.current, {
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        delay: 0.3,
        ease: "power2.out",
      });
    }

    // Stats animation
    if (statsRef.current) {
      gsap.from(statsRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.9,
        ease: "power2.out",
      });
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      {/* Enhanced decorative background elements */}
      <div className="absolute top-24 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse-slow"></div>
      <div
        className="absolute bottom-12 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <h1
              ref={textRef}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400"
            >
              Transform Your Learning Journey
            </h1>
            <p
              ref={subTextRef}
              className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-[600px] leading-relaxed"
            >
              Discover an immersive educational platform where{" "}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                interactive courses
              </span>
              ,{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                expert tutors
              </span>
              , and{" "}
              <span className="text-violet-600 dark:text-violet-400 font-medium">
                AI-powered tools
              </span>{" "}
              converge to create personalized learning experiences.
            </p>
            <div
              ref={buttonContainerRef}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-lg font-medium px-8 py-6"
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 rounded-full border-blue-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all duration-300 text-lg font-medium px-8 py-6"
              >
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </div>

            {/* Animated stats */}
            <div ref={statsRef} className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xl">
                    500+
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Expert Courses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xl">
                    10K+
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Active Students
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-violet-100 dark:bg-violet-900/30 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-violet-600 dark:text-violet-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xl">
                    95%
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Completion Rate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image container with modern educational imagery */}
          <div
            ref={imageContainerRef}
            className="relative h-[500px] md:h-[600px] transition-all duration-500 transform order-first lg:order-last"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-blue-100 dark:border-blue-900/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 z-10"></div>
              <Image
                src="/images/hero-education.jpg"
                alt="Modern education platform with students learning online"
                fill
                className="object-cover object-center"
                priority
              />

              {/* Overlay elements to enhance educational theme */}
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg z-20 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 rounded-lg p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Interactive Learning
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Engage with interactive lessons, quizzes, and AI-powered
                      feedback
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative badges */}
              <div className="absolute top-8 right-8 bg-white dark:bg-slate-800 rounded-full shadow-lg px-4 py-2 z-20 flex items-center gap-2 border border-blue-100 dark:border-blue-900/40">
                <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Live Classes Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
