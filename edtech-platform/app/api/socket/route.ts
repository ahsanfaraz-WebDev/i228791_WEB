import { initSocketServer } from "@/lib/socketio/server";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic to ensure the API route is not cached
export const dynamic = "force-dynamic";

// Set a short revalidation period
export const revalidate = 0;

// Add CORS headers for socket connections
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

// Handle GET requests for socket connections
export async function GET(req: NextRequest) {
  try {
    // Return quick 200 response with CORS headers
    return new NextResponse(null, { 
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Socket route error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
}

// Handle POST requests for socket connections
export async function POST(req: NextRequest) {
  try {
    // Return quick 200 response with CORS headers
    return new NextResponse(null, { 
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Socket route error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// We're using the Socket.IO initialization in the lib/socketio/server.ts file
// This API route just serves as an endpoint for Socket.IO to connect to
