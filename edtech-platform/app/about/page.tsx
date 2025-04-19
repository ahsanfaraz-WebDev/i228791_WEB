import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About EduSphere</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              At EduSphere, we're on a mission to democratize education by connecting passionate tutors with eager
              learners worldwide. We believe that quality education should be accessible to everyone, regardless of
              location or background.
            </p>
          </section>

          <div className="relative h-80 w-full rounded-lg overflow-hidden my-8">
            <Image
              src="/placeholder.svg?height=400&width=800"
              alt="Students learning together"
              fill
              className="object-cover"
            />
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Founded in 2023, EduSphere began with a simple idea: create a platform where knowledge sharing is
              seamless, engaging, and effective. Our founders, a group of educators and technologists, recognized the
              limitations of traditional online learning platforms and set out to build something better.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Today, EduSphere hosts thousands of courses across diverse subjects, from programming and design to
              business and personal development. Our innovative features like AI-enhanced video transcripts and
              real-time interaction have revolutionized how online education is delivered and experienced.
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-6 my-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Our Values</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Accessibility for all learners</li>
                  <li>Quality education without compromise</li>
                  <li>Innovation in teaching methods</li>
                  <li>Community-driven growth</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Our Impact</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>50,000+ students enrolled</li>
                  <li>2,000+ courses available</li>
                  <li>500+ expert tutors</li>
                  <li>120+ countries reached</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Our Technology</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>AI-powered video transcription</li>
                  <li>Real-time collaboration tools</li>
                  <li>Adaptive learning paths</li>
                  <li>Secure payment processing</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              We're a diverse team of educators, engineers, designers, and lifelong learners committed to transforming
              online education.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Sarah Johnson", role: "CEO & Co-founder" },
                { name: "Michael Chen", role: "CTO & Co-founder" },
                { name: "Emily Rodriguez", role: "Head of Education" },
                { name: "David Kim", role: "Lead Designer" },
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden mb-4">
                    <Image
                      src={`/placeholder.svg?height=160&width=160&text=${member.name.split(" ")[0]}`}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
