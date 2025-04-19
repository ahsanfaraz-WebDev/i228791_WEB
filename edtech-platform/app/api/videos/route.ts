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

    const formData = await req.formData()
    const courseId = formData.get("courseId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const videoFile = formData.get("video") as File

    if (!courseId || !title || !videoFile) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ message: "Only teachers can upload videos" }, { status: 403 })
    }

    // Verify course ownership
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(courseId),
      instructorId: user._id,
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found or you don't have permission" }, { status: 404 })
    }

    // In a real implementation, you would:
    // 1. Upload the video to a storage service (e.g., AWS S3)
    // 2. Process the video for transcoding
    // 3. Generate AI transcription

    // For this example, we'll simulate these steps
    const videoUrl = `/api/videos/${new ObjectId()}`
    const transcription = "This is a simulated AI-generated transcription of the video content."

    // Add video to course
    const videoId = new ObjectId()
    await db.collection("videos").insertOne({
      _id: videoId,
      courseId: new ObjectId(courseId),
      title,
      description,
      url: videoUrl,
      transcription,
      duration: 0, // Would be calculated from actual video
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update course with video reference
    await db.collection("courses").updateOne(
      { _id: new ObjectId(courseId) },
      {
        $push: { videos: videoId },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json(
      {
        message: "Video uploaded successfully",
        videoId: videoId.toString(),
        transcription,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
