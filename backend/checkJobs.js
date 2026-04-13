require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkJobs() {
    const { data } = await supabase.from('jobs').select('*');
    console.log(JSON.stringify(data, null, 2));
}
checkJobs();
