import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Features />
      <Testimonials />
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Learning Experience?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Join thousands of tutors and students already using our platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
