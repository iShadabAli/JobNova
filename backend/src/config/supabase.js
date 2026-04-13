const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
  process.exit(1);
}

// Public client (for client-side operations with Row Level Security)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (for server-side operations that bypass RLS)
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null;

// Test connection function
const testConnection = async () => {
  try {
    // Use auth.getSession() to test connection - works without any tables
    const { error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    console.log('✅ Supabase connection successful!');
    console.log(`   URL: ${supabaseUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  testConnection
};
