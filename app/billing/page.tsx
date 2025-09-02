"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, ArrowLeft } from "lucide-react"
import { PLANS } from "@/lib/stripe"
import { toast } from "sonner"
import Link from "next/link"

// User profile data structure
interface UserProfile {
  id: string
  email: string
  plan_type: string
  subscription_status: string
  customer_id?: string
}

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Load user data and handle success/cancel redirects
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error loading profile:", profileError)
        } else {
          setProfile(profileData)
        }

        // Handle success/cancel redirects from Stripe
        if (searchParams.get("success")) {
          toast.success("Subscription updated successfully!")
        } else if (searchParams.get("canceled")) {
          toast.error("Subscription update was cancelled")
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase, searchParams])

  // Handle plan upgrade by creating Stripe checkout session
  const handleUpgrade = async (planType: string) => {
    if (!user || !profile) return

    setUpgrading(planType)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      // Redirect to Stripe checkout
      const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      const stripeInstance = await stripe
      await stripeInstance?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast.error("Failed to start checkout process")
    } finally {
      setUpgrading(null)
    }
  }

  // Handle billing portal access for existing customers
  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      // Redirect to Stripe customer portal
      window.location.href = url
    } catch (error) {
      console.error("Error accessing billing portal:", error)
      toast.error("Failed to access billing portal")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Billing & Plans</h1>
              <p className="text-muted-foreground">Manage your subscription and billing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold capitalize">{profile.plan_type} Plan</h3>
                    <Badge variant={profile.subscription_status === "active" ? "default" : "secondary"}>
                      {profile.subscription_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile.plan_type === "free"
                      ? "Free tier with basic features"
                      : `$${(PLANS[profile.plan_type as keyof typeof PLANS]?.price || 0) / 100}/month`}
                  </p>
                </div>

                {profile.customer_id && (
                  <Button onClick={handleManageBilling} variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(PLANS).map(([key, plan]) => {
                const isCurrentPlan = profile.plan_type === key
                const isUpgrading = upgrading === key

                return (
                  <Card key={key} className={isCurrentPlan ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {isCurrentPlan && <Badge>Current</Badge>}
                      </div>
                      <CardDescription>{plan.price === 0 ? "Free" : `$${plan.price / 100}/month`}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {!isCurrentPlan && plan.priceId && (
                        <Button className="w-full" onClick={() => handleUpgrade(key)} disabled={isUpgrading}>
                          {isUpgrading ? "Processing..." : "Upgrade"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
