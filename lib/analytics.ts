import { createClient } from "@/lib/supabase/client"

// Analytics utility functions for tracking user engagement and performance
// These functions help monitor app usage and identify optimization opportunities

export interface AnalyticsEvent {
  eventType: "page_view" | "upload_start" | "upload_complete" | "plan_upgrade" | "login" | "signup"
  eventData?: Record<string, any>
  sessionId?: string
}

export interface PerformanceMetric {
  metricType: "upload_time" | "api_response" | "ai_description_time" | "page_load"
  metricValue: number // Time in milliseconds
  endpoint?: string
  metadata?: Record<string, any>
}

// Track user analytics events
export async function trackEvent(event: AnalyticsEvent) {
  try {
    const supabase = createClient()

    // Get current user if available
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get user agent and session info
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : null
    const sessionId =
      event.sessionId || (typeof window !== "undefined" ? window.sessionStorage.getItem("session_id") : null)

    const { error } = await supabase.from("user_analytics").insert({
      user_id: user?.id || null,
      event_type: event.eventType,
      event_data: event.eventData || {},
      session_id: sessionId,
      user_agent: userAgent,
    })

    if (error) {
      console.error("Error tracking analytics event:", error)
    }
  } catch (error) {
    console.error("Error tracking analytics event:", error)
  }
}

// Track performance metrics
export async function trackPerformance(metric: PerformanceMetric) {
  try {
    const supabase = createClient()

    // Get current user if available
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("performance_metrics").insert({
      metric_type: metric.metricType,
      metric_value: metric.metricValue,
      endpoint: metric.endpoint,
      user_id: user?.id || null,
      metadata: metric.metadata || {},
    })

    if (error) {
      console.error("Error tracking performance metric:", error)
    }
  } catch (error) {
    console.error("Error tracking performance metric:", error)
  }
}

// Performance monitoring hook for measuring execution time
export function usePerformanceMonitor() {
  const measureTime = async <T,>(
    operation: () => Promise<T>,
    metricType: PerformanceMetric["metricType"],
    endpoint?: string,
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const result = await operation()
      const endTime = performance.now()
      const duration = endTime - startTime

      // Track the performance metric
      await trackPerformance({
        metricType,
        metricValue: duration,
        endpoint,
        metadata: { success: true },
      })

      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      // Track failed operation performance
      await trackPerformance({
        metricType,
        metricValue: duration,
        endpoint,
        metadata: { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      })

      throw error
    }
  }

  return { measureTime }
}

// Page view tracking hook
export function usePageTracking() {
  const trackPageView = (pageName: string, additionalData?: Record<string, any>) => {
    trackEvent({
      eventType: "page_view",
      eventData: {
        page: pageName,
        timestamp: new Date().toISOString(),
        ...additionalData,
      },
    })
  }

  return { trackPageView }
}

// Upload tracking utilities
export const uploadAnalytics = {
  trackUploadStart: (fileCount: number, totalSize: number) => {
    trackEvent({
      eventType: "upload_start",
      eventData: {
        file_count: fileCount,
        total_size: totalSize,
        timestamp: new Date().toISOString(),
      },
    })
  },

  trackUploadComplete: (fileCount: number, successCount: number, duration: number) => {
    trackEvent({
      eventType: "upload_complete",
      eventData: {
        file_count: fileCount,
        success_count: successCount,
        failure_count: fileCount - successCount,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
    })
  },
}

// Business metrics tracking
export const businessAnalytics = {
  trackPlanUpgrade: (fromPlan: string, toPlan: string, revenue: number) => {
    trackEvent({
      eventType: "plan_upgrade",
      eventData: {
        from_plan: fromPlan,
        to_plan: toPlan,
        revenue_cents: revenue,
        timestamp: new Date().toISOString(),
      },
    })
  },

  trackSignup: (method = "email") => {
    trackEvent({
      eventType: "signup",
      eventData: {
        method,
        timestamp: new Date().toISOString(),
      },
    })
  },

  trackLogin: (method = "email") => {
    trackEvent({
      eventType: "login",
      eventData: {
        method,
        timestamp: new Date().toISOString(),
      },
    })
  },
}
