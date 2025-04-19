import { CheckCircle } from "lucide-react"

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform is designed to be intuitive and easy to use for both students and teachers.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 lg:gap-20 mt-12">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border ml-6 hidden md:block"></div>

            <div className="space-y-10 relative">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm md:mt-1">
                  <span className="font-bold">1</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Sign Up / Login</h3>
                  <p className="text-muted-foreground">
                    Create an account or log in to access the platform. Choose your role as a student or teacher.
                  </p>
                  <ul className="grid gap-2 mt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Register with email/password or OAuth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Secure authentication system</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm md:mt-1">
                  <span className="font-bold">2</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Browse or Create Courses</h3>
                  <p className="text-muted-foreground">
                    Students can browse the course catalog, while teachers can create and manage their courses.
                  </p>
                  <ul className="grid gap-2 mt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Search and filter courses by category</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Preview course content before enrolling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Teachers can upload videos and create course materials</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm md:mt-1">
                  <span className="font-bold">3</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Enroll and Learn</h3>
                  <p className="text-muted-foreground">
                    Students can enroll in courses and access all learning materials, including AI-transcribed videos.
                  </p>
                  <ul className="grid gap-2 mt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Secure payment processing for course enrollment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Watch videos with AI-generated transcripts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Track progress through course materials</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm md:mt-1">
                  <span className="font-bold">4</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Interact in Real-Time</h3>
                  <p className="text-muted-foreground">
                    Engage with tutors and peers through real-time chat rooms for each course.
                  </p>
                  <ul className="grid gap-2 mt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Join course-specific chat rooms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Ask questions and receive immediate feedback</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Receive notifications for important announcements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
