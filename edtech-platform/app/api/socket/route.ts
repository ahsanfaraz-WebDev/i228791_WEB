import { initSocketServer } from "@/lib/socketio/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Return empty 200 response to acknowledge the socket connection
  return new NextResponse(null, { status: 200 });
}

// We're using the Socket.IO initialization in the lib/socketio/server.ts file
// This API route just serves as an endpoint for Socket.IO to connect to
