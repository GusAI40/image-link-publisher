import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, PLANS } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { notifyBillingUpdate } from "@/lib/notifications"
import type Stripe from "stripe"

// Webhook endpoint to handle Stripe events and sync subscription data
// This keeps user profiles updated when subscriptions change
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature to ensure it's from Stripe
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createClient()

  try {
    // Handle different Stripe event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userId = subscription.metadata.userId
        const planType = subscription.metadata.planType

        if (userId && planType && PLANS[planType as keyof typeof PLANS]) {
          const plan = PLANS[planType as keyof typeof PLANS]

          // Update user profile with new subscription details
          await supabase
            .from("user_profiles")
            .update({
              customer_id: customerId,
              subscription_id: subscription.id,
              plan_type: planType,
              subscription_status: subscription.status,
              images_limit: plan.limits.images,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          await notifyBillingUpdate(userId, planType, subscription.status)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (userId) {
          // Downgrade user to free plan when subscription is cancelled
          const freePlan = PLANS.free
          await supabase
            .from("user_profiles")
            .update({
              plan_type: "free",
              subscription_status: "cancelled",
              subscription_id: null,
              images_limit: freePlan.limits.images,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          await notifyBillingUpdate(userId, "free", "cancelled")
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          // Update subscription status to active on successful payment
          const { data: profile } = await supabase
            .from("user_profiles")
            .update({
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("subscription_id", subscriptionId)
            .select("id, plan_type")
            .single()

          if (profile) {
            await notifyBillingUpdate(profile.id, profile.plan_type, "active")
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          // Update subscription status to past_due on failed payment
          const { data: profile } = await supabase
            .from("user_profiles")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("subscription_id", subscriptionId)
            .select("id, plan_type")
            .single()

          if (profile) {
            await notifyBillingUpdate(profile.id, profile.plan_type, "past_due")
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
