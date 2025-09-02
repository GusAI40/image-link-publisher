// Test Gemini 2.5 Flash API with advanced tagging and object detection
require('dotenv').config({ path: '.env.local' });

async function testGemini25API() {
  const testImageUrl = "https://emtwbizmorqwhboebgzw.supabase.co/storage/v1/object/public/images/uploads/1756766521138-9breag.jpg";
  
  try {
    console.log("Testing Gemini 2.5 Flash API with advanced tagging...");
    console.log("API Key exists:", !!process.env.GOOGLE_AI_API_KEY);
    
    // Fetch image and convert to base64
    const imageResponse = await fetch(testImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    console.log("Image fetched successfully, size:", imageBuffer.byteLength);
    
    // Call Gemini 2.5 Flash API with enhanced prompt
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
    });

    console.log("Gemini 2.5 Flash API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini 2.5 Flash API error:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Model version:", data.modelVersion);
    console.log("Usage metadata:", data.usageMetadata);
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Generated analysis length:", text?.length);
    console.log("First 300 chars:", text?.substring(0, 300) + "...");
    
    // Look for structured output
    if (text?.includes("Objects:") || text?.includes("Tags:") || text?.includes("Elements:")) {
      console.log("✅ Enhanced tagging and object detection working!");
    }
    
  } catch (error) {
    console.error("Gemini 2.5 Flash test failed:", error);
  }
}

testGemini25API();
