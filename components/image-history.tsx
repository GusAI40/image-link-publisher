"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Copy, Download, ExternalLink, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Image data structure from database
interface ImageRecord {
  id: string
  filename: string
  original_name: string
  public_url: string
  description: string
  file_size: number
  mime_type: string
  created_at: string
  upload_session_id: string
}

interface ImageHistoryProps {
  userId: string
}

export function ImageHistory({ userId }: ImageHistoryProps) {
  const [images, setImages] = useState<ImageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()

  // Load user's image history from database
  const loadImages = async () => {
    console.log('[IMAGE HISTORY] Starting loadImages...')
    setLoading(true)
    try {
      console.log('[IMAGE HISTORY] Making Supabase query...')
      
      const { data, error } = await supabase
        .from("uploaded_images")
        .select("*")
        .order("created_at", { ascending: false })

      console.log('[IMAGE HISTORY] Query completed:', { data: data?.length, error })

      if (error) {
        console.error("[IMAGE HISTORY] Error loading images:", error)
        setImages([])
      } else {
        console.log(`[IMAGE HISTORY] Successfully loaded ${data?.length || 0} images`)
        setImages(data || [])
      }
    } catch (error) {
      console.error("[IMAGE HISTORY] Catch error:", error)
      setImages([])
    } finally {
      console.log('[IMAGE HISTORY] Setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('[IMAGE HISTORY] useEffect triggered, calling loadImages')
    loadImages()
  }, [])

  // Auto-refresh every 30 seconds to pick up new descriptions
  useEffect(() => {
    const interval = setInterval(() => {
      loadImages()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Filter images based on search term
  const filteredImages = images.filter(
    (image) =>
      image.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Copy URL to clipboard
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("URL copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  // Copy markdown format to clipboard
  const copyMarkdown = async (image: ImageRecord) => {
    const markdown = `![${image.description || image.original_name}](${image.public_url})`
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success("Markdown copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy markdown")
    }
  }

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  console.log(`[IMAGE HISTORY] Render - Loading: ${loading}, Images: ${images.length}, Filtered: ${filteredImages.length}`)

  // Don't show early returns - let the main component handle loading states

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image History</CardTitle>
          <CardDescription>View and manage all your uploaded images</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadImages}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading images...</p>
          </CardContent>
        </Card>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? "No images found matching your search." : "No images uploaded yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Image thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={image.public_url || "/placeholder.svg"}
                      alt={image.description || image.original_name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>

                  {/* Image details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm truncate">{image.original_name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {image.description || "No description available"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(image.file_size)}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(image.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => copyUrl(image.public_url)} title="Copy URL">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyMarkdown(image)} title="Copy Markdown">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild title="Open in new tab">
                          <a href={image.public_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
