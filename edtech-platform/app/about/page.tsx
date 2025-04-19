import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About EduSphere</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              At EduSphere, we're on a mission to democratize education by
              connecting passionate tutors with eager learners worldwide. We
              believe that quality education should be accessible to everyone,
              regardless of location or background.
            </p>
          </section>

          <div className="relative h-80 w-full rounded-lg overflow-hidden my-8">
            <Image
              src="/images/banners/education-banner.jpg"
              alt="Students learning together"
              fill
              className="object-cover"
            />
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              EduSphere was founded in 2023 by a group of educators and
              technologists who recognized the limitations of traditional online
              learning platforms. We noticed that while content delivery had
              evolved, the interactive and community aspects of education were
              often neglected.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Our platform was built with a focus on engagement, accessibility,
              and personalization. Through innovative features like AI-enhanced
              video content, real-time collaboration tools, and adaptive
              learning paths, we're creating a more immersive and effective
              educational experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Sets Us Apart</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-2">Community-Driven</h3>
                  <p>
                    We foster connections between students and educators,
                    creating vibrant learning communities.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-2">AI-Enhanced</h3>
                  <p>
                    Our platform leverages artificial intelligence to improve
                    content accessibility and personalization.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-2">Quality Content</h3>
                  <p>
                    We maintain high standards for our courses through rigorous
                    review and feedback processes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-2">
                    Accessible Design
                  </h3>
                  <p>
                    EduSphere is built with accessibility in mind, ensuring
                    education is available to all learners.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="relative h-80 w-full rounded-lg overflow-hidden my-8">
            <Image
              src="/images/banners/team-banner.jpg"
              alt="Our team collaborating"
              fill
              className="object-cover"
            />
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              We're a diverse team of educators, engineers, designers, and
              lifelong learners committed to transforming online education.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  name: "Sarah Johnson",
                  role: "CEO & Co-founder",
                  image: "/images/team/sarah-johnson.jpg",
                },
                {
                  name: "Michael Chen",
                  role: "CTO & Co-founder",
                  image: "/images/team/michael-chen.jpg",
                },
                {
                  name: "Emily Rodriguez",
                  role: "Head of Education",
                  image: "/images/team/emily-rodriguez.jpg",
                },
                {
                  name: "David Kim",
                  role: "Lead Designer",
                  image: "/images/team/david-kim.jpg",
                },
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
