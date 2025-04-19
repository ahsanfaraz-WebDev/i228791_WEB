"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { CourseService } from "@/lib/services/course-service"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  courseId: string
  courseTitle: string
  price: number
}

export function Checkout({ courseId, courseTitle, price }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Create PaymentIntent as soon as the page loads
  useState(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: price, courseId, courseTitle }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error)
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        })
      })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your purchase</CardTitle>
        <CardDescription>
          You're enrolling in <strong>{courseTitle}</strong> for ${price.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <CheckoutForm courseId={courseId} />
          </Elements>
        ) : (
          <div className="py-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CheckoutForm({ courseId }: { courseId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements || !user) {
      return
    }

    setIsLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      })

      if (error) {
        throw new Error(error.message || "Payment failed")
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Enroll the student in the course
        await CourseService.enrollInCourse(courseId, user.id, paymentIntent.id)

        toast({
          title: "Payment successful!",
          description: "You have been enrolled in the course.",
        })

        router.push(`/dashboard/courses/${courseId}`)
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
        {isLoading ? "Processing..." : "Pay now"}
      </Button>
    </form>
  )
}
