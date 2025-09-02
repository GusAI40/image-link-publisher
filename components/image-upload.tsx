"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  file: File
  id: string
  preview: string
  progress: number
  error?: string
  uploaded?: boolean
  publicUrl?: string
  dbId?: string
}

interface ImageUploadProps {
  onFilesUploaded?: (files: any[]) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
}

export function ImageUpload({
  onFilesUploaded,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sessionId = useRef(Math.random().toString(36).substring(7))

  const validateFile = useCallback(
    (file: File): string | null => {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

      if (!allowedTypes.includes(file.type)) {
        return "File type not supported. Please use JPEG, PNG, GIF, or WebP."
      }

      if (file.size > maxFileSize) {
        return `File size too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB.`
      }

      return null
    },
    [maxFileSize],
  )

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: UploadedFile[] = []

      if (files.length + fileList.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} images at once.`)
        return
      }

      Array.from(fileList).forEach((file) => {
        const error = validateFile(file)
        const id = Math.random().toString(36).substring(7)

        newFiles.push({
          file,
          id,
          preview: URL.createObjectURL(file),
          progress: 0,
          error,
          uploaded: false,
        })
      })

      setFiles((prev) => [...prev, ...newFiles])
    },
    [files.length, maxFiles, validateFile],
  )

  const uploadFiles = useCallback(async () => {
    const validFiles = files.filter((f) => !f.error && !f.uploaded)
    if (validFiles.length === 0) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      validFiles.forEach((fileData) => {
        formData.append("files", fileData.file)
      })
      formData.append("sessionId", sessionId.current)

      console.log(`[v0] Starting upload of ${validFiles.length} files`)

      setFiles((prev) => prev.map((f) => (validFiles.some((vf) => vf.id === f.id) ? { ...f, progress: 10 } : f)))

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("[v0] Upload response:", result)

      setFiles((prev) =>
        prev.map((f) => {
          const uploadResult = result.results.find((r: any) => r.originalName === f.file.name)

          if (uploadResult) {
            if (uploadResult.success) {
              return {
                ...f,
                progress: 100,
                uploaded: true,
                publicUrl: uploadResult.publicUrl,
                dbId: uploadResult.id,
              }
            } else {
              return {
                ...f,
                progress: 0,
                error: uploadResult.error,
              }
            }
          }
          return f
        }),
      )

      if (onFilesUploaded) {
        const uploadResults = result.results.map((r: any) => ({
          ...r,
          sessionId: result.sessionId,
        }))
        onFilesUploaded(uploadResults)
      }
    } catch (error) {
      console.log("[v0] Upload error:", error)

      setFiles((prev) =>
        prev.map((f) =>
          validFiles.some((vf) => vf.id === f.id)
            ? { ...f, progress: 0, error: "Upload failed. Please try again." }
            : f,
        ),
      )
    } finally {
      setIsUploading(false)
    }
  }, [files, onFilesUploaded])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles)
      }
    },
    [processFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles)
      }
      e.target.value = ""
    },
    [processFiles],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)
      const removed = prev.find((f) => f.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    files.forEach((file) => URL.revokeObjectURL(file.preview))
    setFiles([])
  }, [files])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const validFilesCount = files.filter((f) => !f.error).length
  const uploadedFilesCount = files.filter((f) => f.uploaded).length
  const hasValidFiles = validFilesCount > 0 && uploadedFilesCount < validFilesCount

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card
        className={cn(
          "relative border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          files.length > 0 && "border-solid border-border",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div
            className={cn(
              "rounded-full p-4 mb-4 transition-colors",
              isDragOver ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            <Upload className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-semibold mb-2">{isDragOver ? "Drop your images here" : "Upload your images"}</h3>

          <p className="text-muted-foreground mb-4 max-w-sm">
            Drag and drop up to {maxFiles} images here, or click to browse your files
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>JPEG, PNG, GIF, WebP</span>
            <span>•</span>
            <span>Max {Math.round(maxFileSize / 1024 / 1024)}MB each</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </Card>

      {hasValidFiles && (
        <div className="flex justify-center">
          <Button onClick={uploadFiles} disabled={isUploading} size="lg" className="px-8">
            {isUploading ? "Uploading..." : `Upload ${validFilesCount - uploadedFilesCount} Images`}
          </Button>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">
              Selected Images ({files.length}/{maxFiles})
            </h4>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />

                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {file.uploaded && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}

                  {file.error && (
                    <div className="absolute inset-0 bg-destructive/90 flex items-center justify-center">
                      <div className="text-center text-destructive-foreground p-2">
                        <AlertCircle className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-xs">{file.error}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium truncate" title={file.file.name}>
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(1)} MB</p>

                  {file.progress > 0 && file.progress < 100 && <Progress value={file.progress} className="h-1" />}

                  {file.uploaded && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Uploaded
                    </div>
                  )}

                  {file.publicUrl && (
                    <p className="text-xs text-muted-foreground truncate" title={file.publicUrl}>
                      URL: {file.publicUrl}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
