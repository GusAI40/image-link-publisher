import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe, PLANS } from "@/lib/stripe"

// API route to create Stripe checkout sessions for subscription upgrades
// This handles the payment flow when users want to upgrade their plan
export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()

    // Validate the requested plan exists and has a price ID
    if (!planType || !PLANS[planType as keyof typeof PLANS] || !PLANS[planType as keyof typeof PLANS].priceId) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    const supabase = createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check current subscription status
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const plan = PLANS[planType as keyof typeof PLANS]

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer_email: profile.email,
      line_items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/billing?success=true`,
      cancel_url: `${request.nextUrl.origin}/billing?canceled=true`,
      metadata: {
        userId: user.id,
        planType: planType,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
