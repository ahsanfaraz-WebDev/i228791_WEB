import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    const videos = await db
      .collection("videos")
      .find({ courseId: new ObjectId(params.id) })
      .sort({ createdAt: 1 })
      .toArray()

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
