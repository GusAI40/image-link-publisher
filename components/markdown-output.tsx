"use client"

// This component generates and displays markdown output for uploaded images
// It creates formatted markdown with image descriptions and public URLs for easy copying
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Structure for uploaded image data
interface UploadedImage {
  id: string
  originalName: string
  publicUrl: string
  description?: string
  fileSize: number
  mimeType: string
}

interface MarkdownOutputProps {
  images: UploadedImage[]
  sessionId: string
}

export function MarkdownOutput({ images, sessionId }: MarkdownOutputProps) {
  const [markdown, setMarkdown] = useState("")
  const [copied, setCopied] = useState(false)

  // Generate markdown content from uploaded images
  const generateMarkdown = useCallback(() => {
    if (images.length === 0) {
      setMarkdown("")
      return
    }

    console.log("[v0] Generating markdown for", images.length, "images")

    // Create markdown header
    let markdownContent = `# Uploaded Images\n\n`
    markdownContent += `*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*\n\n`
    markdownContent += `**Session ID:** \`${sessionId}\`\n\n`
    markdownContent += `---\n\n`

    // Add each image with its description and link
    images.forEach((image, index) => {
      const imageNumber = index + 1
      const description = image.description || `Image ${imageNumber}: ${image.originalName}`

      // Add image section
      markdownContent += `## Image ${imageNumber}\n\n`
      markdownContent += `**Description:** ${description}\n\n`
      markdownContent += `**Original Name:** ${image.originalName}\n\n`
      markdownContent += `**File Size:** ${(image.fileSize / 1024 / 1024).toFixed(2)} MB\n\n`
      markdownContent += `**Public URL:** [${image.originalName}](${image.publicUrl})\n\n`

      // Add markdown image syntax
      markdownContent += `### Markdown Image Syntax\n\n`
      markdownContent += `\`\`\`markdown\n`
      markdownContent += `![${description}](${image.publicUrl})\n`
      markdownContent += `\`\`\`\n\n`

      // Add HTML image syntax
      markdownContent += `### HTML Image Syntax\n\n`
      markdownContent += `\`\`\`html\n`
      markdownContent += `<img src="${image.publicUrl}" alt="${description}" />\n`
      markdownContent += `\`\`\`\n\n`

      if (index < images.length - 1) {
        markdownContent += `---\n\n`
      }
    })

    // Add footer with usage instructions
    markdownContent += `---\n\n`
    markdownContent += `## Usage Instructions\n\n`
    markdownContent += `1. **Copy the markdown syntax** above to use in your documents\n`
    markdownContent += `2. **Use the public URLs** directly in any website or application\n`
    markdownContent += `3. **Share the URLs** - they are publicly accessible and permanent\n\n`
    markdownContent += `*All images are hosted on Supabase Storage and are publicly accessible.*\n`

    setMarkdown(markdownContent)
  }, [images, sessionId])

  // Copy markdown to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      console.log("[v0] Markdown copied to clipboard")

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log("[v0] Failed to copy to clipboard:", error)
      // Fallback: select the text
      const textarea = document.querySelector("textarea[readonly]") as HTMLTextAreaElement
      if (textarea) {
        textarea.select()
        document.execCommand("copy")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }, [markdown])

  // Download markdown as file
  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `images-${sessionId}-${Date.now()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log("[v0] Markdown file downloaded")
  }, [markdown, sessionId])

  // Generate markdown when images change
  useEffect(() => {
    generateMarkdown()
  }, [generateMarkdown])

  if (images.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Markdown</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Copy and paste this markdown anywhere you need it</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className={cn("transition-all duration-200", copied && "bg-primary text-primary-foreground")}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadMarkdown}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={markdown}
          readOnly
          className="min-h-[400px] font-mono text-sm resize-none"
          placeholder="Your generated markdown will appear here..."
        />

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>{images.length} images</span>
          <span>•</span>
          <span>{markdown.length} characters</span>
          <span>•</span>
          <span>{markdown.split("\n").length} lines</span>
        </div>
      </CardContent>
    </Card>
  )
}
