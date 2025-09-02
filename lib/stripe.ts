import Stripe from "stripe"

// Initialize Stripe with secret key from environment variables
// This creates a server-side Stripe client for handling payments and subscriptions
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  : null

// Subscription plan configurations with pricing and limits
// These define the different tiers available to users
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: ["100 images per month", "AI descriptions", "Basic support", "Shareable links"],
    limits: {
      images: 100,
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  },
  basic: {
    name: "Basic",
    price: 499, // $4.99 in cents
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: ["100 images per month", "AI descriptions", "Public shareable links", "Basic support"],
    limits: {
      images: 100,
      fileSize: 25 * 1024 * 1024, // 25MB
    },
  },
  professional: {
    name: "Professional",
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    features: [
      "500 images per month",
      "AI descriptions",
      "Public shareable links",
      "Priority processing",
      "API access",
      "Email support",
    ],
    limits: {
      images: 500,
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 2999, // $29.99 in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Unlimited images",
      "Custom AI descriptions",
      "Bulk upload",
      "Analytics dashboard",
      "Priority support",
      "White-label options",
    ],
    limits: {
      images: 999999,
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  },
} as const

export type PlanType = keyof typeof PLANS
