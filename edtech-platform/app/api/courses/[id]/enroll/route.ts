import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify course exists
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(params.id),
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check if user is already enrolled
    const isEnrolled = course.students.some((studentId: ObjectId) => studentId.equals(user._id))

    if (isEnrolled) {
      return NextResponse.json({ message: "You are already enrolled in this course" }, { status: 400 })
    }

    // In a real implementation, you would process payment here if the course is not free

    // Enroll user in course
    await db.collection("courses").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $push: { students: user._id },
        $set: { updatedAt: new Date() },
      },
    )

    // Add course to user's enrolled courses
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $push: { enrolledCourses: new ObjectId(params.id) },
      },
    )

    return NextResponse.json({ message: "Enrolled successfully" })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
