import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    const video = await db.collection("videos").findOne({
      _id: new ObjectId(params.id),
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    // In a real implementation, you would check if the user has access to this video
    // by verifying they are enrolled in the course or are the instructor

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description } = body

    const { db } = await connectToDatabase()

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ message: "Only teachers can update videos" }, { status: 403 })
    }

    // Get video
    const video = await db.collection("videos").findOne({
      _id: new ObjectId(params.id),
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    // Verify course ownership
    const course = await db.collection("courses").findOne({
      _id: video.courseId,
      instructorId: user._id,
    })

    if (!course) {
      return NextResponse.json({ message: "You don't have permission to update this video" }, { status: 403 })
    }

    // Update video
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description

    await db.collection("videos").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    return NextResponse.json({ message: "Video updated successfully" })
  } catch (error) {
    console.error("Error updating video:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ message: "Only teachers can delete videos" }, { status: 403 })
    }

    // Get video
    const video = await db.collection("videos").findOne({
      _id: new ObjectId(params.id),
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    // Verify course ownership
    const course = await db.collection("courses").findOne({
      _id: video.courseId,
      instructorId: user._id,
    })

    if (!course) {
      return NextResponse.json({ message: "You don't have permission to delete this video" }, { status: 403 })
    }

    // Delete video
    await db.collection("videos").deleteOne({ _id: new ObjectId(params.id) })

    // Remove video reference from course
    await db.collection("courses").updateOne(
      { _id: video.courseId },
      {
        $pull: { videos: new ObjectId(params.id) },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json({ message: "Video deleted successfully" })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
