import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Image Link Publisher - Upload Images & Get Shareable Links",
  description:
    "Upload up to 10 images simultaneously and generate permanent shareable links with AI-generated descriptions. Perfect for websites, social media, and documentation.",
  generator: "v0.app",
  keywords: ["image upload", "shareable links", "markdown", "AI descriptions", "image hosting"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
