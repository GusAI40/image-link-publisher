// Fix descriptions with proper authentication to bypass RLS
require('dotenv').config({ path: '.env.local' });

async function fixDescriptionsAuthenticated() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // First, sign in as the user to bypass RLS
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // You'll need to provide the actual user email
      password: 'password123' // You'll need to provide the actual password
    });

    if (authError) {
      console.log('⚠️  Authentication failed, trying without auth...');
      console.log('This might be due to RLS policies requiring user authentication');
    }

    // Get images with specific user_id from the SQL query results
    const userId = '7af7e40d-d5bb-427b-adec-80dd95208529';
    
    const { data: images, error: fetchError } = await supabase
      .from('uploaded_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);

    if (fetchError) {
      console.error('❌ Error fetching images:', fetchError);
      console.log('💡 This confirms RLS is blocking access. Need to run descriptions in the upload API context.');
      return;
    }

    console.log(`📊 Found ${images.length} images for user ${userId}`);

    if (images.length === 0) {
      console.log('❌ No images found. RLS policies may be blocking access.');
      console.log('💡 The async description generation should run in the upload API context where the user is authenticated.');
      return;
    }

    // Check which ones need descriptions
    const needsDescription = images.filter(img => !img.description || img.description.trim() === '');
    console.log(`🔍 ${needsDescription.length} images need descriptions`);

    // Process first 3 images to avoid rate limits
    for (let i = 0; i < Math.min(needsDescription.length, 3); i++) {
      const image = needsDescription[i];
      
      console.log(`\n🔄 Processing ${i + 1}/${Math.min(needsDescription.length, 3)}: ${image.original_name}`);

      try {
        const descResponse = await fetch('http://localhost:3001/api/describe-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: image.public_url,
            filename: image.original_name,
          }),
        });

        if (!descResponse.ok) {
          console.log(`❌ API failed: ${descResponse.status}`);
          continue;
        }

        const { description } = await descResponse.json();
        console.log(`📝 Generated: ${description.substring(0, 100)}...`);

        const { error: updateError } = await supabase
          .from('uploaded_images')
          .update({ description })
          .eq('id', image.id);

        if (updateError) {
          console.log(`❌ Update failed:`, updateError);
        } else {
          console.log(`✅ Updated ${image.original_name}`);
        }

        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.log(`❌ Error:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixDescriptionsAuthenticated();
