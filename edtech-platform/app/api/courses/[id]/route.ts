import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    const course = await db.collection("courses").findOne({
      _id: new ObjectId(params.id),
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
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
    const { title, description, category, price } = body

    const { db } = await connectToDatabase()

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify course ownership
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(params.id),
      instructorId: user._id,
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found or you don't have permission" }, { status: 404 })
    }

    // Update fields
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (price !== undefined) updateData.price = price

    await db.collection("courses").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    return NextResponse.json({ message: "Course updated successfully" })
  } catch (error) {
    console.error("Error updating course:", error)
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

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify course ownership
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(params.id),
      instructorId: user._id,
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found or you don't have permission" }, { status: 404 })
    }

    // Delete course
    await db.collection("courses").deleteOne({ _id: new ObjectId(params.id) })

    // Delete associated videos
    await db.collection("videos").deleteMany({ courseId: new ObjectId(params.id) })

    // Delete associated chat messages
    await db.collection("chat_messages").deleteMany({ courseId: new ObjectId(params.id) })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
