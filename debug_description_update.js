// Debug script to manually update descriptions for recent uploads
require('dotenv').config({ path: '.env.local' });

async function debugDescriptionUpdate() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Get specific images that need descriptions
    const imageIds = [
      'b46cf49b-5047-4fbf-b9ac-cefebb1cb38a',
      '06070f87-e160-4fac-a05e-52d847bf8454',
      '26163bca-8408-441f-825e-77e0465d6a36',
      '27020734-4cf7-4e17-887a-ffa4ff054f76',
      '8edc9e69-1a00-4e28-9b08-d59a489739c9',
      '64cf045b-99b3-40cb-973b-730f2c32e6af',
      '6d2ae19e-daec-4fb2-acf6-c03e498750b6',
      '0149c40c-fb1e-4764-a81b-3386b0931492',
      'c0e71fba-83d6-4b2d-ab18-d7228152daca',
      '73517160-9db8-4b0f-89f9-8b7ac67a5a08'
    ];

    // First check what's in the database
    const { data: allImages, error: allError } = await supabase
      .from('uploaded_images')
      .select('id, original_name, description, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (allError) {
      console.error('Error fetching all images:', allError);
      return;
    }

    console.log('Recent images in database:');
    allImages.forEach(img => {
      console.log(`${img.original_name}: ${img.description ? 'HAS DESC' : 'NULL'} (${img.id})`);
    });

    // Now get images that need descriptions
    const { data: images, error: fetchError } = await supabase
      .from('uploaded_images')
      .select('*')
      .is('description', null)
      .order('created_at', { ascending: false })
      .limit(15);

    if (fetchError) {
      console.error('Error fetching images:', fetchError);
      return;
    }

    console.log(`Found ${images.length} images to process`);
    
    // Show current description status
    images.forEach(img => {
      console.log(`${img.original_name}: ${img.description ? 'HAS DESCRIPTION' : 'NULL DESCRIPTION'}`);
    });

    for (const image of images) {
      console.log(`\nProcessing: ${image.original_name}`);
      console.log(`Image ID: ${image.id}`);
      console.log(`Public URL: ${image.public_url}`);

      try {
        // Generate description
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
          console.error(`Description API failed: ${descResponse.status}`);
          continue;
        }

        const { description } = await descResponse.json();
        console.log(`Generated description length: ${description.length}`);

        // Update database
        const { error: updateError } = await supabase
          .from('uploaded_images')
          .update({ description })
          .eq('id', image.id);

        if (updateError) {
          console.error(`Database update failed:`, updateError);
        } else {
          console.log(`✅ Successfully updated description for ${image.original_name}`);
        }

      } catch (error) {
        console.error(`Error processing ${image.original_name}:`, error);
      }
    }

  } catch (error) {
    console.error('Debug script failed:', error);
  }
}

debugDescriptionUpdate();
