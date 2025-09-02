import { createClient } from "@/lib/supabase/server"

// Notification utility functions for creating and managing notifications
// These functions handle creating notifications and sending emails

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "upload" | "billing" | "system"
  actionUrl?: string
  metadata?: Record<string, any>
}

// Create a new notification in the database
export async function createNotification(params: CreateNotificationParams) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("notifications").insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      action_url: params.actionUrl,
      metadata: params.metadata || {},
    })

    if (error) {
      console.error("Error creating notification:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error }
  }
}

// Send upload completion notification
export async function notifyUploadComplete(userId: string, imageCount: number, sessionId: string) {
  return createNotification({
    userId,
    title: "Upload Complete",
    message: `Successfully uploaded ${imageCount} image${imageCount > 1 ? "s" : ""} with AI descriptions`,
    type: "upload",
    actionUrl: `/dashboard?session=${sessionId}`,
    metadata: { imageCount, sessionId },
  })
}

// Send upload error notification
export async function notifyUploadError(userId: string, error: string) {
  return createNotification({
    userId,
    title: "Upload Failed",
    message: `Image upload failed: ${error}`,
    type: "error",
    metadata: { error },
  })
}

// Send billing notification
export async function notifyBillingUpdate(userId: string, planType: string, status: string) {
  const title = status === "active" ? "Subscription Updated" : "Billing Issue"
  const message =
    status === "active"
      ? `Your ${planType} plan is now active`
      : `There was an issue with your ${planType} subscription`

  return createNotification({
    userId,
    title,
    message,
    type: "billing",
    actionUrl: "/billing",
    metadata: { planType, status },
  })
}

// Send system notification
export async function notifySystem(userId: string, title: string, message: string, actionUrl?: string) {
  return createNotification({
    userId,
    title,
    message,
    type: "system",
    actionUrl,
  })
}

// Get user notification preferences
export async function getUserNotificationPreferences(userId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error getting notification preferences:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting notification preferences:", error)
    return null
  }
}

// Send email notification (placeholder for email service integration)
export async function sendEmailNotification(email: string, subject: string, message: string, actionUrl?: string) {
  // This would integrate with an email service like SendGrid, Resend, or AWS SES
  // For now, we'll just log the email that would be sent
  console.log("Email notification:", {
    to: email,
    subject,
    message,
    actionUrl,
  })

  // In a real implementation, you would:
  // 1. Check user's email preferences
  // 2. Format the email template
  // 3. Send via your email service
  // 4. Handle delivery status

  return { success: true }
}
