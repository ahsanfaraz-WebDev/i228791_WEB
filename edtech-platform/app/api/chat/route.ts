import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, message } = body

    if (!courseId || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify course exists and user has access
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(courseId),
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check if user is instructor or enrolled student
    const hasAccess =
      course.instructorId.equals(user._id) || course.students.some((studentId: ObjectId) => studentId.equals(user._id))

    if (!hasAccess) {
      return NextResponse.json({ message: "You don't have access to this course's chat" }, { status: 403 })
    }

    // Add message to chat
    const result = await db.collection("chat_messages").insertOne({
      courseId: new ObjectId(courseId),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      message,
      createdAt: new Date(),
    })

    // In a real implementation, you would also broadcast this message
    // to all connected clients using WebSockets

    return NextResponse.json(
      {
        message: "Message sent successfully",
        messageId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ message: "Missing courseId parameter" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify course exists and user has access
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(courseId),
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check if user is instructor or enrolled student
    const hasAccess =
      course.instructorId.equals(user._id) || course.students.some((studentId: ObjectId) => studentId.equals(user._id))

    if (!hasAccess) {
      return NextResponse.json({ message: "You don't have access to this course's chat" }, { status: 403 })
    }

    // Get chat messages
    const messages = await db
      .collection("chat_messages")
      .find({ courseId: new ObjectId(courseId) })
      .sort({ createdAt: 1 })
      .toArray()

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
