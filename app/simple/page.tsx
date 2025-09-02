"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SimpleDashboard } from "@/components/simple-dashboard"

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

export default function SimplePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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
          full_name: 'Gustavo',
          plan_type: 'free',
          images_uploaded: 24,
          images_limit: 50,
          subscription_status: 'active'
        };

        console.log("[SIMPLE] Using test user bypass")
        setUser(testUser)
        setProfile(testProfile)
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return <SimpleDashboard user={user} profile={profile} />
}
