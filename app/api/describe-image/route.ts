import { type NextRequest, NextResponse } from "next/server"

// This API route generates descriptions for uploaded images using AI vision analysis
// It analyzes the actual visual content of images using Google Gemini's vision model
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, filename } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("[v0] Analyzing image content for:", filename)

    // Try Gemini first (free), fallback to OpenAI if needed
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        console.log("[v0] Using Google Gemini 2.5 Flash vision analysis (FREE)")

        // Convert image URL to base64 for Gemini
        const imageResponse = await fetch(imageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: "Analyze this image and provide: 1) A detailed description including objects, colors, composition, and notable features. 2) List all identifiable objects and tags. 3) Detect and describe key elements with their locations. Be comprehensive and specific."
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image
                  }
                }
              ]
            }]
          }),
        })

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!text || text.trim().length === 0) {
          throw new Error("Gemini returned empty response")
        }

        console.log("[v0] Gemini generated description:", text)
        return NextResponse.json({ description: text })

      } catch (geminiError) {
        const errorMessage = geminiError instanceof Error ? geminiError.message : 'Unknown error'
        console.error("[v0] Gemini failed, trying OpenAI fallback:", errorMessage)
      }
    }

    // Fallback to OpenAI if Gemini fails or not configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "AI vision service not configured. Please add Google AI or OpenAI API key.",
        },
        { status: 503 },
      )
    }

    try {
      console.log("[v0] Using OpenAI vision analysis (fallback)")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Describe this image in detail, including objects, colors, composition, and any notable features. Be specific and descriptive.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content

      if (!text || text.trim().length === 0) {
        throw new Error("AI service returned empty response")
      }

      console.log("[v0] AI generated description:", text)

      return NextResponse.json({ description: text })
    } catch (aiError) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error'
      console.error("[v0] AI vision analysis failed:", errorMessage)
      return NextResponse.json(
        {
          error: "AI vision analysis failed. Please try again or contact support.",
          details: errorMessage,
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("[v0] Error generating description:", error)
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 })
  }
}
