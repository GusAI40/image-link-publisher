"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"
import { MarkdownOutput } from "@/components/markdown-output"
import { ImageHistory } from "@/components/image-history"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { PremiumDashboard } from "@/components/premium-dashboard"
import { Upload, ImageIcon, CreditCard, Settings, LogOut, User, BarChart3 } from "lucide-react"
import Link from "next/link"
import { NotificationCenter } from "@/components/notification-center"
import { usePageTracking, uploadAnalytics } from "@/lib/analytics"

// User profile data structure from Supabase
interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan_type: string
  images_uploaded: number
  images_limit: number
  subscription_status: string
}

// Uploaded image data structure
interface UploadedImage {
  id: string
  originalName: string
  publicUrl: string
  description?: string
  fileSize: number
  mimeType: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [sessionId, setSessionId] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { trackPageView } = usePageTracking()

  // Load user data and profile on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // TESTING BYPASS - Skip auth for stress testing
        const testUser = {
          id: '7af7e40d-d5bb-427b-adec-80dd95208529',
          email: 'gus@kai-zen.ai',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {}
        };

        const testProfile = {
          id: '7af7e40d-d5bb-427b-adec-80dd95208529',
          email: 'gus@kai-zen.ai',
          full_name: 'gus',
          plan_type: 'free',
          images_uploaded: 24,
          images_limit: 50,
          subscription_status: 'active'
        };

        console.log("[DASHBOARD] Using test user bypass")
        setUser(testUser)
        setProfile(testProfile)

        trackPageView("dashboard", { user_id: testUser.id })
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Handle user logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Handle successful file uploads
  const handleFilesUploaded = async (uploadResults: any[]) => {
    const newSessionId = uploadResults.find((r) => r.sessionId)?.sessionId || Math.random().toString(36).substring(7)
    setSessionId(newSessionId)

    const successCount = uploadResults.filter((r) => r.success).length
    const totalSize = uploadResults.reduce((sum, r) => sum + (r.fileSize || 0), 0)

    uploadAnalytics.trackUploadStart(uploadResults.length, totalSize)

    // Wait for AI descriptions, then fetch image data
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/images/${newSessionId}`)
        if (response.ok) {
          const data = await response.json()
          setUploadedImages(data.images || [])
        }
      } catch (error) {
        console.error("Error fetching image data:", error)
      }
    }, 2000)

    // Update user's upload count
    if (profile) {
      const newCount = profile.images_uploaded + successCount
      await supabase.from("user_profiles").update({ images_uploaded: newCount }).eq("id", user?.id)

      setProfile({ ...profile, images_uploaded: newCount })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  // Calculate usage percentage for progress bar
  const usagePercentage = (profile.images_uploaded / profile.images_limit) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xl font-bold text-foreground">
                Image Link Publisher
              </Link>
              <Badge variant="secondary" className="text-xs">
                {profile?.plan_type ? profile.plan_type.charAt(0).toUpperCase() + profile.plan_type.slice(1) : 'Free'} Plan
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {profile.images_uploaded} / {profile.images_limit} images used
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/simple">
                  <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    📱 Simple View
                  </Button>
                </Link>
                <Link href="/premium">
                  <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700">
                    ✨ Premium UI
                  </Button>
                </Link>
                <NotificationCenter userId={user.id} />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback>
                    {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile.full_name || profile.email.split("@")[0]}
            </h1>
            <p className="text-muted-foreground">
              Manage your images and generate shareable links with AI descriptions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Images Uploaded</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.images_uploaded}</div>
                <div className="space-y-2 mt-2">
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {profile.images_limit - profile.images_uploaded} remaining this month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{profile.plan_type}</div>
                <p className="text-xs text-muted-foreground mt-1">Status: {profile.subscription_status}</p>
                <Link href="/billing" className="inline-block mt-2">
                  <Button variant="outline" size="sm">Upgrade Plan</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Images</CardTitle>
                    <CardDescription>
                      Upload your images and get AI-generated descriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload onFilesUploaded={handleFilesUploaded} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Content</CardTitle>
                    <CardDescription>
                      Copy and use your generated markdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MarkdownOutput images={uploadedImages} sessionId={sessionId} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <ImageHistory />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
