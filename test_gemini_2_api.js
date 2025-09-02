// Test Gemini 2.0 Flash API to verify upgrade
require('dotenv').config({ path: '.env.local' });

async function testGemini2API() {
  const testImageUrl = "https://emtwbizmorqwhboebgzw.supabase.co/storage/v1/object/public/images/uploads/1756766521138-9breag.jpg";
  
  try {
    console.log("Testing Gemini 2.0 Flash API with image:", testImageUrl);
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
    console.log("MIME type:", mimeType);
    
    // Call Gemini 2.0 Flash API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Describe this image in detail, including objects, colors, composition, and any notable features. Be specific and descriptive."
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

    console.log("Gemini 2.0 Flash API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini 2.0 Flash API error:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Model version:", data.modelVersion);
    console.log("Usage metadata:", data.usageMetadata);
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Generated description length:", text?.length);
    console.log("First 200 chars:", text?.substring(0, 200) + "...");
    
  } catch (error) {
    console.error("Gemini 2.0 Flash test failed:", error);
  }
}

testGemini2API();
