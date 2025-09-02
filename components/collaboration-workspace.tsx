"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Bell,
  Settings
} from "lucide-react"

interface CollaborationWorkspaceProps {
  workspace: {
    id: string
    name: string
    members: Array<{
      id: string
      name: string
      email: string
      role: string
      avatar?: string
      status: 'online' | 'offline' | 'away'
    }>
  }
}

export function CollaborationWorkspace({ workspace }: CollaborationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("projects")
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "comment",
      message: "Sarah commented on 'Product Launch Images'",
      time: "2 minutes ago",
      unread: true
    },
    {
      id: 2,
      type: "approval",
      message: "Marketing campaign images approved",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      type: "upload",
      message: "John uploaded 15 new images",
      time: "3 hours ago",
      unread: false
    }
  ])

  const projects = [
    {
      id: 1,
      name: "Q4 Marketing Campaign",
      status: "in-progress",
      images: 45,
      collaborators: 4,
      deadline: "2025-09-15",
      progress: 75
    },
    {
      id: 2,
      name: "Product Photography",
      status: "review",
      images: 128,
      collaborators: 6,
      deadline: "2025-09-10",
      progress: 95
    },
    {
      id: 3,
      name: "Social Media Assets",
      status: "completed",
      images: 89,
      collaborators: 3,
      deadline: "2025-08-30",
      progress: 100
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      {/* Collaboration Header */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {workspace.name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {workspace.members.length} team members • Real-time collaboration
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Online Members */}
              <div className="flex -space-x-2">
                {workspace.members.slice(0, 5).map((member) => (
                  <div key={member.id} className="relative">
                    <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-green-500' :
                      member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                ))}
                {workspace.members.length > 5 && (
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                    <span className="text-xs font-medium">+{workspace.members.length - 5}</span>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </div>
                  )}
                </Button>
              </div>

              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Projects</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Images Processed</p>
                  <p className="text-2xl font-bold">2,847</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pending Reviews</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Team Efficiency</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Team Projects</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Search projects..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {project.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>{project.images} images</span>
                          <span>{project.collaborators} collaborators</span>
                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{project.progress}% Complete</p>
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <Badge variant={
                        project.status === 'completed' ? 'default' :
                        project.status === 'in-progress' ? 'secondary' : 'outline'
                      }>
                        {project.status.replace('-', ' ')}
                      </Badge>
                      
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                      <div className={`w-2 h-2 rounded-full ${notification.unread ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-slate-500">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-white/20">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workspace.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
