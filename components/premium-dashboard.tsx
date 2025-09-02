"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Crown, 
  Rocket,
  Brain,
  Eye,
  Target,
  Layers,
  Palette
} from "lucide-react"

interface PremiumDashboardProps {
  user: any
  profile: any
}

export function PremiumDashboard({ user, profile }: PremiumDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [aiInsights, setAiInsights] = useState<any[]>([])

  // Premium features data
  const premiumStats = {
    aiProcessingPower: 95,
    contentOptimization: 88,
    brandConsistency: 92,
    performanceScore: 97
  }

  const aiInsightsData = [
    {
      type: "optimization",
      title: "Image Performance Boost",
      description: "Your images could get 34% more engagement with AI-optimized descriptions",
      impact: "High",
      action: "Optimize Now"
    },
    {
      type: "trend",
      title: "Trending Keywords Detected",
      description: "AI found 12 trending keywords in your niche for better SEO",
      impact: "Medium",
      action: "Apply Tags"
    },
    {
      type: "brand",
      title: "Brand Voice Analysis",
      description: "Your content maintains 92% brand consistency across uploads",
      impact: "Excellent",
      action: "View Report"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Premium Header with Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  AI Image Studio Pro
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Powered by Advanced AI Vision
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 border-0">
                <Crown className="w-3 h-3 mr-1" />
                Pro Plan
              </Badge>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                <Rocket className="w-4 h-4 mr-2" />
                Upgrade to Enterprise
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(premiumStats).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      {key === 'aiProcessingPower' && <Brain className="w-5 h-5 text-white" />}
                      {key === 'contentOptimization' && <Target className="w-5 h-5 text-white" />}
                      {key === 'brandConsistency' && <Palette className="w-5 h-5 text-white" />}
                      {key === 'performanceScore' && <TrendingUp className="w-5 h-5 text-white" />}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {value}%
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <Progress value={value} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Insights Panel */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Real-time optimization recommendations
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {aiInsightsData.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      insight.impact === 'High' ? 'bg-red-100 dark:bg-red-900' :
                      insight.impact === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-green-100 dark:bg-green-900'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={insight.impact === 'High' ? 'destructive' : insight.impact === 'Medium' ? 'default' : 'secondary'}>
                      {insight.impact}
                    </Badge>
                    <Button size="sm" variant="outline">
                      {insight.action}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Batch Processing */}
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Batch AI Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Process up to 1000 images simultaneously with advanced AI analysis
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Batch Process
              </Button>
            </CardContent>
          </Card>

          {/* Smart Collections */}
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Smart Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                AI automatically organizes images by content, style, and purpose
              </p>
              <Button variant="outline" className="w-full">
                View Collections
              </Button>
            </CardContent>
          </Card>

          {/* Brand Analytics */}
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Brand Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Deep insights into brand consistency and performance metrics
              </p>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
