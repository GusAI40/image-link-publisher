// Admin script to fix NULL descriptions using direct database access
require('dotenv').config({ path: '.env.local' });

async function fixNullDescriptions() {
  const { createClient } = require('@supabase/supabase-js');
  
  // Create admin client that bypasses RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    console.log('🔍 Fetching images with NULL descriptions...');
    
    // Get all images with NULL descriptions
    const { data: images, error: fetchError } = await supabase
      .from('uploaded_images')
      .select('*')
      .is('description', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching images:', fetchError);
      return;
    }

    console.log(`📊 Found ${images.length} images with NULL descriptions`);

    if (images.length === 0) {
      console.log('✅ No images need description updates');
      return;
    }

    // Process each image
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const image = images[i];
      
      console.log(`\n🔄 Processing ${i + 1}/${Math.min(images.length, 5)}: ${image.original_name}`);
      console.log(`📷 Image ID: ${image.id}`);
      console.log(`🔗 URL: ${image.public_url}`);

      try {
        // Call the description API
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
          console.log(`❌ Description API failed: ${descResponse.status} ${descResponse.statusText}`);
          continue;
        }

        const { description } = await descResponse.json();
        
        if (!description) {
          console.log('❌ No description returned from API');
          continue;
        }

        console.log(`📝 Generated description: ${description.substring(0, 100)}...`);

        // Update the database directly
        const { error: updateError } = await supabase
          .from('uploaded_images')
          .update({ description })
          .eq('id', image.id);

        if (updateError) {
          console.log(`❌ Database update failed:`, updateError);
        } else {
          console.log(`✅ Successfully updated description for ${image.original_name}`);
        }

        // Wait between requests to avoid rate limits
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.log(`❌ Error processing ${image.original_name}:`, error.message);
      }
    }

    console.log('\n🎉 Description fix process completed!');
    console.log('🔄 Refresh your Image History page to see the updates');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixNullDescriptions();
