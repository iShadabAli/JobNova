require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkAdmin() {
    const { data } = await supabase.from('profiles').select('*');
    const admins = data.filter(u => `${u.role}`.toLowerCase().includes('admin'));
    console.log("Admins:", admins);
    console.log("All roles:", [...new Set(data.map(u => u.role))]);
}
checkAdmin();
