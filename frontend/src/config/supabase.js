import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// Support both naming conventions
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
