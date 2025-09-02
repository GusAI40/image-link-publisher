// Zod schemas for type-safe validation throughout the application
// Following Windsurf Rules v10x+ for schema-enforced development

import { z } from "zod"

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  plan_type: z.enum(["free", "pro", "enterprise"]).default("free"),
  images_uploaded: z.number().int().min(0).default(0),
  images_limit: z.number().int().min(1).default(50),
  subscription_status: z.enum(["active", "inactive", "cancelled"]).default("active"),
  stripe_customer_id: z.string().optional(),
  stripe_subscription_id: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

// Uploaded Image Schema
export const UploadedImageSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  original_name: z.string().min(1),
  file_size: z.number().int().min(1),
  mime_type: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  storage_path: z.string().min(1),
  public_url: z.string().url(),
  description: z.string().optional(),
  upload_session_id: z.string().min(1),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type UploadedImage = z.infer<typeof UploadedImageSchema>

// File Upload Request Schema
export const FileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1).max(10),
  sessionId: z.string().min(1),
})

export type FileUploadRequest = z.infer<typeof FileUploadSchema>

// Image Description Request Schema
export const ImageDescriptionSchema = z.object({
  imageUrl: z.string().url(),
  filename: z.string().min(1),
})

export type ImageDescriptionRequest = z.infer<typeof ImageDescriptionSchema>

// Analytics Event Schema
export const AnalyticsEventSchema = z.object({
  eventType: z.enum(["page_view", "upload_start", "upload_complete", "plan_upgrade", "login", "signup"]),
  eventData: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
})

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>

// Performance Metric Schema
export const PerformanceMetricSchema = z.object({
  metricType: z.enum(["upload_time", "api_response", "ai_description_time", "page_load"]),
  metricValue: z.number().min(0), // Time in milliseconds
  endpoint: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["info", "success", "warning", "error", "upload", "billing", "system"]).default("info"),
  read: z.boolean().default(false),
  action_url: z.string().url().optional(),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Notification = z.infer<typeof NotificationSchema>

// API Response Schemas
export const UploadResponseSchema = z.object({
  results: z.array(z.object({
    originalName: z.string(),
    success: z.boolean(),
    id: z.string().uuid().optional(),
    publicUrl: z.string().url().optional(),
    filename: z.string().optional(),
    fileSize: z.number().optional(),
    mimeType: z.string().optional(),
    error: z.string().optional(),
  })),
  sessionId: z.string(),
})

export type UploadResponse = z.infer<typeof UploadResponseSchema>

export const ImageDescriptionResponseSchema = z.object({
  description: z.string().min(1),
})

export type ImageDescriptionResponse = z.infer<typeof ImageDescriptionResponseSchema>

// Environment Variables Schema
export const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
})

export type Env = z.infer<typeof EnvSchema>

// Form Validation Schemas
export const LoginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginForm = z.infer<typeof LoginFormSchema>

export const SignUpFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  repeatPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ["repeatPassword"],
})

export type SignUpForm = z.infer<typeof SignUpFormSchema>

// Image Upload Component Props Schema
export const ImageUploadPropsSchema = z.object({
  onFilesUploaded: z.function().args(z.array(z.any())).returns(z.void()).optional(),
  maxFiles: z.number().int().min(1).max(50).default(10),
  maxFileSize: z.number().int().min(1024).default(10 * 1024 * 1024), // 10MB default
})

export type ImageUploadProps = z.infer<typeof ImageUploadPropsSchema>

// Markdown Output Component Props Schema
export const MarkdownOutputPropsSchema = z.object({
  images: z.array(z.object({
    id: z.string(),
    originalName: z.string(),
    publicUrl: z.string().url(),
    description: z.string().optional(),
    fileSize: z.number(),
    mimeType: z.string(),
  })),
  sessionId: z.string().min(1),
})

export type MarkdownOutputProps = z.infer<typeof MarkdownOutputPropsSchema>

// Validation helper functions
export const validateEnv = () => {
  try {
    return EnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    })
  } catch (error) {
    console.error("Environment validation failed:", error)
    throw new Error("Invalid environment configuration")
  }
}

// File validation helper
export const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

  if (!allowedTypes.includes(file.type)) {
    return "File type not supported. Please use JPEG, PNG, GIF, or WebP."
  }

  if (file.size > maxSize) {
    return `File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
  }

  return null
}
