// Test Gemini API directly to debug description issue
require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
  const testImageUrl = "https://emtwbizmorqwhboebgzw.supabase.co/storage/v1/object/public/images/uploads/1756766521138-9breag.jpg";
  
  try {
    console.log("Testing Gemini API with image:", testImageUrl);
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
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
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

    console.log("Gemini API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Full Gemini response:", JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Extracted description:", text);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testGeminiAPI();
