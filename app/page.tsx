"use client"

import { Button } from "@/components/ui/button"
import { Upload, Sparkles, Share2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🚀 The Best AI Image Publisher Ever Built
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload images, get AI-generated descriptions, and create shareable links with markdown formatting.
            Perfect for blogs, documentation, and social media.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/simple">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                📱 Try Simple Version
              </Button>
            </Link>
            <Link href="/premium">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                ✨ Premium Experience
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="px-8 py-3">
                💼 Standard Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Upload className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dead Simple Upload</h3>
              <p className="text-gray-600">
                Drag and drop your images - works perfectly every time
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Powerful AI Descriptions</h3>
              <p className="text-gray-600">
                Advanced AI analyzes your images and generates amazing descriptions
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Share2 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Share Everywhere</h3>
              <p className="text-gray-600">
                Get permanent links and markdown code - use anywhere on the web
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🎯 Choose Your Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-green-600 mb-2">📱 Simple</h3>
                <p className="text-sm text-gray-600">Perfect for beginners. Big buttons, clear instructions, no confusion.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-blue-600 mb-2">💼 Standard</h3>
                <p className="text-sm text-gray-600">Balanced interface with all core features for regular users.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-purple-600 mb-2">✨ Premium</h3>
                <p className="text-sm text-gray-600">Advanced features, analytics, and professional interface.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">🚀 The most powerful AI image publisher on the web</p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
              <span>• Works perfectly every time</span>
              <span>• Lightning fast AI processing</span>
              <span>• Professional results</span>
              <span>• Zero learning curve</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
