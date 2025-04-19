import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const { db } = await connectToDatabase()

    // Build query
    const query: any = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const courses = await db.collection("courses").find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, price } = body

    if (!title || !description || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ message: "Only teachers can create courses" }, { status: 403 })
    }

    const result = await db.collection("courses").insertOne({
      title,
      description,
      category,
      price: price || 0,
      instructorId: user._id,
      instructorName: user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      students: [],
      videos: [],
      ratings: [],
      published: false,
    })

    return NextResponse.json(
      {
        message: "Course created successfully",
        courseId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
