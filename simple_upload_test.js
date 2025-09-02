// Simple upload test to bypass all authentication issues
require('dotenv').config({ path: '.env.local' });

async function simpleUploadTest() {
  console.log('🚀 SIMPLE UPLOAD TEST - BYPASSING ALL AUTH');
  console.log('=' .repeat(50));

  const { createClient } = require('@supabase/supabase-js');
  
  // Create admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Step 1: Test direct database insert
    console.log('📊 Testing direct database insert...');
    
    const testRecord = {
      user_id: '7af7e40d-d5bb-427b-adec-80dd95208529',
      upload_session_id: `test-session-${Date.now()}`,
      filename: `test-${Date.now()}.png`,
      original_name: `test-${Date.now()}.png`,
      file_size: 1024,
      mime_type: 'image/png',
      storage_path: `test/${Date.now()}.png`,
      public_url: `https://example.com/test-${Date.now()}.png`,
      description: null
    };

    const { data: insertData, error: insertError } = await supabase
      .from('uploaded_images')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.log('❌ Direct insert failed:', insertError.message);
      
      // Try to create a bypass policy
      console.log('🔧 Creating bypass policy...');
      
      const policySQL = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'uploaded_images' 
            AND policyname = 'Allow all for testing'
          ) THEN
            CREATE POLICY "Allow all for testing" ON uploaded_images FOR ALL USING (true) WITH CHECK (true);
          END IF;
        END $$;
      `;
      
      console.log('💡 Run this SQL in Supabase dashboard:');
      console.log(policySQL);
      
    } else {
      console.log('✅ Direct insert successful!');
      console.log('📋 Inserted record:', insertData[0]?.id);
      
      // Step 2: Test description update
      console.log('\n🧪 Testing description update...');
      
      const testDescription = 'This is a test description generated at ' + new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('uploaded_images')
        .update({ description: testDescription })
        .eq('id', insertData[0].id);

      if (updateError) {
        console.log('❌ Description update failed:', updateError.message);
      } else {
        console.log('✅ Description update successful!');
        
        // Step 3: Verify the update
        const { data: verifyData, error: verifyError } = await supabase
          .from('uploaded_images')
          .select('description')
          .eq('id', insertData[0].id)
          .single();

        if (verifyError) {
          console.log('❌ Verification failed:', verifyError.message);
        } else {
          console.log('✅ Verification successful!');
          console.log('📝 Description:', verifyData.description?.substring(0, 50) + '...');
        }
      }
      
      // Clean up
      await supabase
        .from('uploaded_images')
        .delete()
        .eq('id', insertData[0].id);
      
      console.log('🧹 Test record cleaned up');
    }

    // Step 4: Test AI description API
    console.log('\n🤖 Testing AI description API...');
    
    const testImageUrl = 'https://picsum.photos/200/200?random=' + Date.now();
    
    const descResponse = await fetch('http://localhost:3000/api/describe-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: testImageUrl,
        filename: 'test-image.jpg'
      })
    });

    if (descResponse.ok) {
      const { description } = await descResponse.json();
      console.log('✅ AI API works!');
      console.log('📝 Sample:', description.substring(0, 80) + '...');
    } else {
      console.log('❌ AI API failed:', descResponse.status);
    }

    console.log('\n🎯 DIAGNOSIS:');
    
    if (!insertError) {
      console.log('✅ Database access: WORKING');
      console.log('✅ RLS policies: ALLOWING ACCESS');
      console.log('💡 The upload API auth bypass should work');
      console.log('🔧 Issue is likely in the upload API implementation');
    } else {
      console.log('❌ Database access: BLOCKED BY RLS');
      console.log('💡 Need to fix RLS policies first');
      console.log('🔧 Run the bypass policy SQL in Supabase dashboard');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n🏁 SIMPLE TEST COMPLETE');
}

// Add fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

simpleUploadTest().catch(console.error);
