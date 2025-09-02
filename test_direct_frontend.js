// Test direct frontend data access without authentication
require('dotenv').config({ path: '.env.local' });

async function testDirectFrontend() {
  console.log('🔍 TESTING DIRECT FRONTEND DATA ACCESS');
  console.log('=' .repeat(50));

  const { createClient } = require('@supabase/supabase-js');
  
  // Use exact same configuration as frontend components
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Test Image History component query
  console.log('\n📊 IMAGE HISTORY COMPONENT TEST');
  try {
    const { data, error } = await supabase
      .from("uploaded_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log('❌ Image History failed:', error.message);
      console.log('   Code:', error.code);
      console.log('   Hint:', error.hint);
    } else {
      console.log('✅ Image History successful');
      console.log(`   Found: ${data?.length || 0} images`);
      
      if (data && data.length > 0) {
        console.log('\n📋 Sample Images:');
        data.slice(0, 3).forEach((img, i) => {
          console.log(`   ${i+1}. ${img.original_name}`);
          console.log(`      Created: ${new Date(img.created_at).toLocaleString()}`);
          console.log(`      Has Description: ${img.description ? '✅' : '❌'}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Image History error:', err.message);
  }

  // Test Analytics component queries
  console.log('\n📊 ANALYTICS COMPONENT TEST');
  
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });
    console.log('✅ Users count:', totalUsers || 0);

    // Total uploads
    const { count: totalUploads } = await supabase
      .from("uploaded_images")
      .select("*", { count: "exact", head: true });
    console.log('✅ Uploads count:', totalUploads || 0);

    // Daily data
    const { data: dailyData } = await supabase
      .from("uploaded_images")
      .select("created_at")
      .order("created_at", { ascending: true });
    console.log('✅ Daily data points:', dailyData?.length || 0);

    // Plan distribution
    const { data: planData } = await supabase
      .from("user_profiles")
      .select("plan_type");
    console.log('✅ Plan data:', planData?.length || 0, 'users');

  } catch (err) {
    console.log('❌ Analytics error:', err.message);
  }

  // Test authentication status
  console.log('\n📊 AUTHENTICATION STATUS');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Auth error:', error.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('⚠️  No authenticated user (expected for anon key)');
    }
  } catch (err) {
    console.log('❌ Auth check error:', err.message);
  }

  console.log('\n🎯 DIAGNOSIS:');
  console.log('If queries work here but not in browser:');
  console.log('1. Check browser console for errors');
  console.log('2. Verify component authentication flow');
  console.log('3. Check if RLS policies are blocking frontend');
  console.log('4. Ensure components are actually rendering');

  console.log('\n🏁 DIRECT FRONTEND TEST COMPLETE');
}

testDirectFrontend().catch(console.error);
