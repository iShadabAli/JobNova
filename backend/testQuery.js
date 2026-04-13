require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testQuery() {
    let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Active')
        .eq('type', 'blue')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

    const searchWords = ['tap'];
    if (searchWords && searchWords.length > 0) {
        const orConditions = searchWords.map(word => 
            `title.ilike.%${word}%,location.ilike.%${word}%,description.ilike.%${word}%,skills.ilike.%${word}%`
        ).join(',');
        query = query.or(orConditions);
    }
    
    console.log("Query URL:", query.url.toString());

    const { data, error } = await query;
    console.log("Data length:", data.length);
    console.log("Data titles:", data.map(j => j.title));
}
testQuery();
