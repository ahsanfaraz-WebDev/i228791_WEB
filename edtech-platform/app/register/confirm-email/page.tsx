"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";

export default function ConfirmEmailPage() {
  return (
    <div className="container flex h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription className="text-base">
            We've sent you a confirmation email. Please check your inbox and
            click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder. The confirmation
            link will expire after 24 hours.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Return to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
