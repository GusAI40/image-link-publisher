// Test script to verify description generation is working
require('dotenv').config({ path: '.env.local' });

async function testDescriptionGeneration() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    console.log('🔍 Checking for recent uploads with descriptions...');
    
    // Get the most recent 5 images
    const { data: recentImages, error } = await supabase
      .from('uploaded_images')
      .select('id, original_name, description, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching images:', error);
      console.log('💡 This confirms RLS is still blocking access from scripts');
      return;
    }

    if (recentImages.length === 0) {
      console.log('❌ No images found - RLS is blocking access');
      console.log('💡 Need to test by actually uploading through the web interface');
      return;
    }

    console.log(`📊 Found ${recentImages.length} recent images:`);
    
    recentImages.forEach((img, index) => {
      const hasDesc = img.description && img.description.trim() !== '';
      console.log(`\n${index + 1}. ${img.original_name}`);
      console.log(`   Created: ${new Date(img.created_at).toLocaleString()}`);
      console.log(`   Description: ${hasDesc ? '✅ HAS DESCRIPTION' : '❌ NULL/EMPTY'}`);
      if (hasDesc) {
        console.log(`   Preview: ${img.description.substring(0, 100)}...`);
      }
    });

    const withDescriptions = recentImages.filter(img => img.description && img.description.trim() !== '');
    const withoutDescriptions = recentImages.filter(img => !img.description || img.description.trim() === '');

    console.log(`\n📈 SUMMARY:`);
    console.log(`   ✅ With descriptions: ${withDescriptions.length}`);
    console.log(`   ❌ Without descriptions: ${withoutDescriptions.length}`);
    
    if (withoutDescriptions.length > 0) {
      console.log('\n💡 RECOMMENDATION: Upload a new test image through the web interface to verify the fix');
    } else {
      console.log('\n🎉 All recent images have descriptions! The fix appears to be working.');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
    console.log('💡 RLS policies are likely blocking script access. Test manually through web interface.');
  }
}

testDescriptionGeneration();
