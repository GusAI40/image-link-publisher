"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Notification data structure from database
interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "upload" | "billing" | "system"
  read: boolean
  action_url?: string
  metadata: Record<string, any>
  created_at: string
}

interface NotificationCenterProps {
  userId: string
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  // Load notifications from database and set up real-time subscription
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) {
          console.error("Error loading notifications:", error)
        } else {
          setNotifications(data || [])
        }
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev.slice(0, 19)])

          // Show toast for new notifications
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url
              ? {
                  label: "View",
                  onClick: () => window.open(newNotification.action_url, "_blank"),
                }
              : undefined,
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)

      if (error) {
        console.error("Error marking notification as read:", error)
      } else {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .in("id", unreadIds)

      if (error) {
        console.error("Error marking all notifications as read:", error)
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      case "upload":
        return "📁"
      case "billing":
        return "💳"
      case "system":
        return "🔧"
      default:
        return "ℹ️"
    }
  }

  // Format relative time for notifications
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No notifications yet</div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-tight">{notification.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(notification.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {notification.action_url && (
                                <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
                                  <Link href={notification.action_url}>
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
