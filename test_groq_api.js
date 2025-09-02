// Test script to verify Groq API key and vision model access
const { generateText } = require('ai');
const { groq } = require('@ai-sdk/groq');

async function testGroqAPI() {
  console.log('Testing Groq API...');
  
  const apiKey = process.env.GROQ_API_KEY;
  console.log('API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY not found in environment');
    return;
  }
  
  try {
    // Test 1: Simple text generation (no vision)
    console.log('\n1. Testing basic text generation...');
    const textResult = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: 'Say hello in one sentence.',
    });
    console.log('✅ Basic text generation works:', textResult.text);
    
    // Test 2: Vision model availability
    console.log('\n2. Testing vision model access...');
    const visionResult = await generateText({
      model: groq('llama-3.2-90b-vision-preview'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image: a simple red circle on white background.',
            },
            {
              type: 'image',
              image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0icmVkIiAvPgo8L3N2Zz4K',
            },
          ],
        },
      ],
    });
    console.log('✅ Vision model works:', visionResult.text);
    
  } catch (error) {
    console.error('❌ Groq API Error:', error.message);
    if (error.message.includes('Forbidden')) {
      console.log('\n🔍 Possible solutions:');
      console.log('1. Check if your Groq API key is valid');
      console.log('2. Verify your account has vision model access');
      console.log('3. Try generating a new API key at https://console.groq.com/');
    }
  }
}

testGroqAPI();
