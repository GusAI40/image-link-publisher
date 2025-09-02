import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

// API route to create Stripe customer portal sessions
// This allows users to manage their billing, update payment methods, and cancel subscriptions
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile.customer_id) {
      return NextResponse.json({ error: "No customer found" }, { status: 404 })
    }

    // Create customer portal session for billing management
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.customer_id,
      return_url: `${request.nextUrl.origin}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
