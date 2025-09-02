// Debug frontend data loading issues
require('dotenv').config({ path: '.env.local' });

async function debugFrontendData() {
  console.log('🔍 DEBUGGING FRONTEND DATA LOADING');
  console.log('=' .repeat(50));

  const { createClient } = require('@supabase/supabase-js');
  
  // Test with same client configuration as frontend
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('📊 Environment Check:');
  console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

  // Test 1: Basic connection
  console.log('\n📊 TEST 1: Basic Connection');
  try {
    const { data, error } = await supabase
      .from('uploaded_images')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('   Code:', error.code);
      console.log('   Details:', error.details);
    } else {
      console.log('✅ Connection successful');
      console.log('   Count:', data?.length || 0);
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }

  // Test 2: Image History Query (exact same as component)
  console.log('\n📊 TEST 2: Image History Query');
  try {
    const { data, error } = await supabase
      .from("uploaded_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log('❌ Image History query failed:', error.message);
      console.log('   Code:', error.code);
      console.log('   Details:', error.details);
    } else {
      console.log('✅ Image History query successful');
      console.log(`   Found ${data?.length || 0} images`);
      if (data && data.length > 0) {
        console.log('   Sample image:', {
          id: data[0].id,
          filename: data[0].filename,
          original_name: data[0].original_name,
          has_description: !!data[0].description
        });
      }
    }
  } catch (err) {
    console.log('❌ Image History error:', err.message);
  }

  // Test 3: Analytics Queries
  console.log('\n📊 TEST 3: Analytics Queries');
  
  // User count
  try {
    const { count: totalUsers } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    console.log('✅ User count query successful:', totalUsers || 0);
  } catch (err) {
    console.log('❌ User count error:', err.message);
  }

  // Upload count
  try {
    const { count: totalUploads } = await supabase
      .from("uploaded_images")
      .select("*", { count: "exact", head: true });

    console.log('✅ Upload count query successful:', totalUploads || 0);
  } catch (err) {
    console.log('❌ Upload count error:', err.message);
  }

  // Plan distribution
  try {
    const { data: planData } = await supabase
      .from("user_profiles")
      .select("plan_type");

    console.log('✅ Plan data query successful:', planData?.length || 0, 'users');
  } catch (err) {
    console.log('❌ Plan data error:', err.message);
  }

  // Test 4: RLS Policy Check
  console.log('\n📊 TEST 4: RLS Policy Check');
  try {
    const { data: policies } = await supabase
      .rpc('get_policies_for_table', { table_name: 'uploaded_images' })
      .single();

    console.log('RLS policies result:', policies);
  } catch (err) {
    console.log('RLS check not available:', err.message);
  }

  console.log('\n🏁 FRONTEND DEBUG COMPLETE');
}

debugFrontendData().catch(console.error);
