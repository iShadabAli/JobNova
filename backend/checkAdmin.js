require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkAdmin() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'admin');
    console.log(JSON.stringify(data, null, 2));
}
checkAdmin();
