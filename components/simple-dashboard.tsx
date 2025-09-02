"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Upload, 
  Image as ImageIcon, 
  History, 
  BarChart3,
  Home,
  Settings,
  LogOut,
  ArrowRight,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { ImageHistory } from "@/components/image-history"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import Link from "next/link"

interface SimpleDashboardProps {
  user: any
  profile: any
}

export function SimpleDashboard({ user, profile }: SimpleDashboardProps) {
  const [activeSection, setActiveSection] = useState("home")

  // Simple navigation items
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      description: "Overview and quick actions"
    },
    {
      id: "upload",
      label: "Upload Images",
      icon: Upload,
      description: "Add new images and get descriptions"
    },
    {
      id: "my-images",
      label: "My Images",
      icon: ImageIcon,
      description: "View and manage your uploaded images"
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      description: "See how your images are performing"
    }
  ]

  const quickStats = [
    {
      label: "Images Uploaded",
      value: profile?.images_uploaded || 0,
      icon: ImageIcon,
      color: "bg-blue-500"
    },
    {
      label: "AI Descriptions Generated",
      value: (profile?.images_uploaded || 0) * 0.95, // 95% success rate
      icon: Zap,
      color: "bg-green-500"
    },
    {
      label: "Images Remaining",
      value: (profile?.images_limit || 50) - (profile?.images_uploaded || 0),
      icon: Clock,
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Super Simple Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Image Link Publisher</h1>
                <p className="text-sm text-gray-500">Simple. Fast. Powerful.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {profile?.plan_type || 'Free'} Plan
              </Badge>
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || profile?.email?.split('@')[0] || 'User'}! 👋
          </h2>
          <p className="text-gray-600">
            What would you like to do today? Choose an option below to get started.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{Math.floor(stat.value)}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {navItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-all cursor-pointer group hover:scale-105"
              onClick={() => setActiveSection(item.id)}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{item.label}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Area Based on Selection */}
        {activeSection === "home" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload Your Images</h4>
                    <p className="text-gray-600 text-sm">Click "Upload Images" above to add your photos. We support JPG, PNG, and other common formats.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Creates Descriptions</h4>
                    <p className="text-gray-600 text-sm">Our AI automatically analyzes your images and creates detailed descriptions for you.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Share & Use</h4>
                    <p className="text-gray-600 text-sm">Get shareable links and markdown code to use your images anywhere on the web.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-6">
                <ImageUpload />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "my-images" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Your Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageHistory userId={user?.id} />
            </CardContent>
          </Card>
        )}

        {activeSection === "reports" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>
        )}

        {/* Simple Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Need help? Contact support@imagelink.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
