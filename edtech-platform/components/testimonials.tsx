"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image_url: string;
  content: string;
  rating: number;
  display_order: number;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/content?type=testimonials");
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching testimonials:", data.error);
          return;
        }

        setTestimonials(data.data);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fallback testimonials in case the API call fails
  const fallbackTestimonials = [
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
  ];

  const displayTestimonials =
    testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <section className="py-20 bg-slate-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl max-w-[700px] mx-auto">
            Hear from educators and learners who have transformed their teaching
            and learning experience with EduSphere.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayTestimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array(testimonial.rating)
                      .fill(null)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-current text-yellow-500"
                        />
                      ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    "{testimonial.content}"
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4 flex items-center">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image_url || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
