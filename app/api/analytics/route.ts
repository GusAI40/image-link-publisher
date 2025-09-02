import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// API route for tracking analytics events and performance metrics
// This endpoint receives analytics data from the client and stores it in the database
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { type, data } = await request.json()

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (type === "event") {
      // Track user analytics event
      const { error } = await supabase.from("user_analytics").insert({
        user_id: user?.id || null,
        event_type: data.eventType,
        event_data: data.eventData || {},
        session_id: data.sessionId,
        user_agent: request.headers.get("user-agent"),
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      })

      if (error) {
        console.error("Error tracking event:", error)
        return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
      }
    } else if (type === "performance") {
      // Track performance metric
      const { error } = await supabase.from("performance_metrics").insert({
        metric_type: data.metricType,
        metric_value: data.metricValue,
        endpoint: data.endpoint,
        user_id: user?.id || null,
        metadata: data.metadata || {},
      })

      if (error) {
        console.error("Error tracking performance:", error)
        return NextResponse.json({ error: "Failed to track performance" }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint for retrieving analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is authenticated and has admin privileges
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, allow all authenticated users to view analytics
    // In production, you'd check for admin role here
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "7d"
    const metricType = searchParams.get("metricType")

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase.from("user_analytics").select("*").gte("created_at", startDate.toISOString())

    if (metricType) {
      query = query.eq("event_type", metricType)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1000)

    if (error) {
      console.error("Error fetching analytics:", error)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Analytics GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
