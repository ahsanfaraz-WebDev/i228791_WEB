import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Features } from "@/components/features";
import { Testimonials } from "@/components/testimonials";
import { HeroSection } from "@/components/hero-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Educational categories section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 mb-2">
                Diverse Learning Opportunities
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Find Your Perfect Course
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Explore courses across a variety of disciplines, designed for
                all skill levels
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/courses?category=${category.slug}`}
                className="group flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`rounded-full p-3 mb-4 ${category.bgColor}`}>
                  <category.icon className={`w-8 h-8 ${category.iconColor}`} />
                </div>
                <h3 className="text-xl font-medium mb-2">{category.name}</h3>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                  Browse Courses
                  <svg
                    className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <Testimonials />

      {/* Enhanced CTA section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                Start Learning Today
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Learning Experience?
              </h2>
              <p className="mx-auto max-w-[800px] text-gray-500 dark:text-gray-400 md:text-xl">
                Join thousands of students and tutors already using our platform
                to achieve their educational goals. Your journey to knowledge
                begins with a single step.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
              >
                <Link href="/register">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700 text-lg px-8 py-6"
              >
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-3xl">
              <div className="flex flex-col items-center p-5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  24/7
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Support Available
                </div>
              </div>
              <div className="flex flex-col items-center p-5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  98%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Student Satisfaction
                </div>
              </div>
              <div className="flex flex-col items-center p-5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                  30+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  New Courses Monthly
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Course categories with icons (using inline SVG for simplicity)
const categories = [
  {
    name: "Programming & Development",
    slug: "programming",
    description: "Learn coding, web development, and software engineering",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
  },
  {
    name: "Business & Finance",
    slug: "business",
    description: "Master business skills, finance, and entrepreneurship",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 1L21 5v6c0 5.5-3.8 10.7-9 12-5.2-1.3-9-6.5-9-12V5l9-4z"></path>
      </svg>
    ),
  },
  {
    name: "Design & Creativity",
    slug: "design",
    description: "Explore graphic design, UX/UI, and creative arts",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
        <path d="M2 2l7.586 7.586"></path>
        <circle cx="11" cy="11" r="2"></circle>
      </svg>
    ),
  },
  {
    name: "Personal Development",
    slug: "personal",
    description: "Improve skills in productivity, wellness, and growth",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];
