// Fix descriptions for specific NULL images
require('dotenv').config({ path: '.env.local' });

async function fixDescriptions() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Specific image IDs that need descriptions
  const imageIds = [
    'b46cf49b-5047-4fbf-b9ac-cefebb1cb38a',
    '06070f87-e160-4fac-a05e-52d847bf8454',
    '26163bca-8408-441f-825e-77e0465d6a36',
    '27020734-4cf7-4e17-887a-ffa4ff054f76',
    '8edc9e69-1a00-4e28-9b08-d59a489739c9'
  ];

  for (const imageId of imageIds) {
    try {
      // Get image details
      const { data: image, error: fetchError } = await supabase
        .from('uploaded_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (fetchError || !image) {
        console.log(`❌ Could not find image ${imageId}`);
        continue;
      }

      console.log(`\n🔄 Processing: ${image.original_name}`);
      console.log(`📷 URL: ${image.public_url}`);

      // Generate description via API
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
        console.log(`❌ API failed for ${image.original_name}: ${descResponse.status}`);
        continue;
      }

      const { description } = await descResponse.json();
      console.log(`📝 Generated description (${description.length} chars)`);

      // Update database
      const { error: updateError } = await supabase
        .from('uploaded_images')
        .update({ description })
        .eq('id', imageId);

      if (updateError) {
        console.log(`❌ Database update failed:`, updateError);
      } else {
        console.log(`✅ Successfully updated ${image.original_name}`);
      }

      // Wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.log(`❌ Error processing ${imageId}:`, error.message);
    }
  }

  console.log('\n🎉 Description fix process completed!');
}

fixDescriptions();
