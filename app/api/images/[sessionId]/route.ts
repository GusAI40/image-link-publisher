// API route to fetch uploaded images by session ID
// This allows the markdown generator to retrieve image data and descriptions
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const supabase = await createClient()
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    console.log("[v0] Fetching images for session:", sessionId)

    // Fetch all images for this session from the database
    const { data: images, error } = await supabase
      .from("uploaded_images")
      .select("*")
      .eq("upload_session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.log("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
    }

    console.log("[v0] Found", images?.length || 0, "images for session")

    // Transform database records to match component interface
    const transformedImages =
      images?.map((image) => ({
        id: image.id,
        originalName: image.original_name,
        publicUrl: image.public_url,
        description: image.description,
        fileSize: image.file_size,
        mimeType: image.mime_type,
        createdAt: image.created_at,
      })) || []

    return NextResponse.json({
      images: transformedImages,
      sessionId,
      count: transformedImages.length,
    })
  } catch (error) {
    console.log("[v0] API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
