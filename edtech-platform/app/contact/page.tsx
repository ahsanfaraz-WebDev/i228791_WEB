"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Message sent!",
        description: "We've received your message and will get back to you soon.",
      })

      // Reset form
      const form = e.target as HTMLFormElement
      form.reset()
    }, 1500)
  }

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-emerald-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For general inquiries:</p>
                  <a href="mailto:info@edusphere.com" className="text-emerald-600 hover:underline">
                    info@edusphere.com
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For support:</p>
                  <a href="mailto:support@edusphere.com" className="text-emerald-600 hover:underline">
                    support@edusphere.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-emerald-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Main Office:</p>
                  <p className="text-emerald-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Support Line:</p>
                  <p className="text-emerald-600">+1 (555) 987-6543</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-emerald-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Visit Us</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Headquarters:</p>
                  <address className="not-italic">
                    123 Education Lane
                    <br />
                    San Francisco, CA 94105
                    <br />
                    United States
                  </address>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide as much detail as possible..."
                    className="min-h-32"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
