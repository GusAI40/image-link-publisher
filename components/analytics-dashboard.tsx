"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Users, Upload, Clock, DollarSign } from "lucide-react"

// Analytics data structures
interface AnalyticsData {
  totalUsers: number
  totalUploads: number
  avgUploadTime: number
  totalRevenue: number
  dailyUploads: Array<{ date: string; uploads: number }>
  planDistribution: Array<{ plan: string; count: number }>
  performanceMetrics: Array<{ endpoint: string; avgTime: number }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const supabase = createClient()

  // Load analytics data from database
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        console.log('[ANALYTICS] Loading analytics data...')
        
        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        startDate.setDate(endDate.getDate() - days)

        // Fetch total users
        const { count: totalUsers } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })
        console.log('[ANALYTICS] Total users:', totalUsers)

        // Fetch total uploads (remove date filters)
        const { count: totalUploads } = await supabase
          .from("uploaded_images")
          .select("*", { count: "exact", head: true })
        console.log('[ANALYTICS] Total uploads:', totalUploads)

        // Mock average upload time since performance_metrics may not exist
        const avgUploadTime = 2.5

        // Fetch daily uploads for chart (remove date filters)
        const { data: dailyData } = await supabase
          .from("uploaded_images")
          .select("created_at")
          .order("created_at", { ascending: true })
        console.log('[ANALYTICS] Daily data:', dailyData?.length)

        // Group by date
        const dailyUploads =
          dailyData?.reduce((acc: Record<string, number>, item) => {
            const date = new Date(item.created_at).toISOString().split("T")[0]
            acc[date] = (acc[date] || 0) + 1
            return acc
          }, {}) || {}

        const dailyUploadsArray = Object.entries(dailyUploads).map(([date, uploads]) => ({
          date,
          uploads: uploads as number,
        }))

        // Fetch plan distribution
        const { data: planData } = await supabase.from("user_profiles").select("plan_type")

        const planDistribution =
          planData?.reduce((acc: Record<string, number>, item) => {
            acc[item.plan_type] = (acc[item.plan_type] || 0) + 1
            return acc
          }, {}) || {}

        const planDistributionArray = Object.entries(planDistribution).map(([plan, count]) => ({
          plan,
          count: count as number,
        }))

        // Mock performance metrics
        const performanceMetrics = [
          { endpoint: "upload", avgTime: 1200 },
          { endpoint: "describe", avgTime: 3500 },
          { endpoint: "auth", avgTime: 150 },
        ]

        setAnalytics({
          totalUsers: totalUsers || 0,
          totalUploads: totalUploads || 0,
          avgUploadTime,
          totalRevenue: 0, // Mock data
          dailyUploads: Object.entries(dailyUploads).map(([date, uploads]) => ({ date, uploads })),
          planDistribution: Object.entries(planDistribution).map(([plan, count]) => ({ plan, count })),
          performanceMetrics,
        })
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  console.log(`[ANALYTICS] Render - Loading: ${loading}, Analytics: ${analytics ? 'loaded' : 'null'}`)

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading analytics...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>No analytics data available</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Unable to load analytics data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (false) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Time Range:</span>
        {["7d", "30d", "90d"].map((range) => (
          <Badge
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange(range)}
          >
            {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}
          </Badge>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUploads.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Upload Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgUploadTime}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="uploads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="uploads">Upload Trends</TabsTrigger>
          <TabsTrigger value="plans">Plan Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads">
          <Card>
            <CardHeader>
              <CardTitle>Daily Uploads</CardTitle>
              <CardDescription>Upload activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyUploads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="uploads" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>User distribution across subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.planDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>Average response times by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgTime" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
