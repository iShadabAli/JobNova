require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkApps() {
    // Get Asad's user id
    const { data: users } = await supabase.from('profiles').select('user_id, full_name');
    console.log("Users:", users);

    const { data: apps } = await supabase.from('applications').select('*');
    console.log("Apps:", apps);
}
checkApps();
