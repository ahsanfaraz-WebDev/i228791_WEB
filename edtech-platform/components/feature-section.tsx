import { BookOpen, Video, MessageSquare, Shield, Zap, Users } from "lucide-react"

export default function FeatureSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Platform Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our EdTech platform combines cutting-edge technology with intuitive design to create an exceptional
              learning experience.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Course Creation</h3>
            <p className="text-center text-muted-foreground">
              Easily create and manage courses with intuitive tools for uploading videos and materials.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI Transcription</h3>
            <p className="text-center text-muted-foreground">
              Automatic AI-powered transcription for all uploaded videos to enhance accessibility.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Real-Time Chat</h3>
            <p className="text-center text-muted-foreground">
              Connect with tutors and peers through real-time chat rooms for each course.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Enrollment</h3>
            <p className="text-center text-muted-foreground">
              Safe and secure course enrollment with integrated payment processing.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Interactive 3D</h3>
            <p className="text-center text-muted-foreground">
              Engaging 3D elements throughout the platform for an immersive learning experience.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Community Learning</h3>
            <p className="text-center text-muted-foreground">
              Foster a community-driven learning environment with discussions and collaboration.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
