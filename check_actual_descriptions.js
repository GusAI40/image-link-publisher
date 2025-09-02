// Check actual description status in database
require('dotenv').config({ path: '.env.local' });

async function checkDescriptions() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Get all recent images with their description status
    const { data: images, error } = await supabase
      .from('uploaded_images')
      .select('id, original_name, description, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Found ${images.length} total images\n`);

    let nullCount = 0;
    let hasDescCount = 0;

    images.forEach((img, index) => {
      const hasDesc = img.description && img.description.trim() !== '';
      const status = hasDesc ? '✅ HAS DESCRIPTION' : '❌ NULL/EMPTY';
      
      if (hasDesc) {
        hasDescCount++;
      } else {
        nullCount++;
      }

      console.log(`${index + 1}. ${img.original_name}`);
      console.log(`   ID: ${img.id}`);
      console.log(`   Status: ${status}`);
      console.log(`   Created: ${new Date(img.created_at).toLocaleString()}`);
      if (hasDesc) {
        console.log(`   Description: ${img.description.substring(0, 80)}...`);
      }
      console.log('');
    });

    console.log(`📈 SUMMARY:`);
    console.log(`   ✅ Images with descriptions: ${hasDescCount}`);
    console.log(`   ❌ Images without descriptions: ${nullCount}`);
    console.log(`   📊 Total images: ${images.length}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkDescriptions();
