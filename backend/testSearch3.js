require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function liveTest() {
    console.log("=== LIVE SEARCH TEST ===\n");
    
    // First, show what jobs exist in the DB
    const { data: allJobs } = await supabase.from('jobs').select('id, title, type, status').eq('status', 'Active').limit(10);
    console.log("All Active Jobs in DB:");
    allJobs.forEach(j => console.log(`  - [${j.type}] "${j.title}"`));
    console.log(`  Total: ${allJobs.length}\n`);

    // Now test search with keyword "mechanic"
    const searchWords = ["mechanic"];
    let query = supabase
        .from('jobs')
        .select('id, title, type, description, skills')
        .eq('status', 'Active')
        .eq('type', 'blue');

    const orConditions = searchWords.map(word => 
        `title.ilike.%${word}%,description.ilike.%${word}%,skills.ilike.%${word}%`
    ).join(',');
    query = query.or(orConditions);

    const { data: matched, error } = await query;
    console.log(`Search for "mechanic" returned ${matched ? matched.length : 0} results:`);
    if (matched) matched.forEach(j => console.log(`  - "${j.title}" | skills: ${j.skills}`));
    if (error) console.log("  Error:", error.message);

    // Test search with keyword "car"
    let query2 = supabase
        .from('jobs')
        .select('id, title, type, description, skills')
        .eq('status', 'Active')
        .eq('type', 'blue');

    const orConditions2 = ["car"].map(word => 
        `title.ilike.%${word}%,description.ilike.%${word}%,skills.ilike.%${word}%`
    ).join(',');
    query2 = query2.or(orConditions2);

    const { data: matched2 } = await query2;
    console.log(`\nSearch for "car" returned ${matched2 ? matched2.length : 0} results:`);
    if (matched2) matched2.forEach(j => console.log(`  - "${j.title}" | skills: ${j.skills}`));
    
    // Test with NO search (what user normally sees)
    const { data: allBlue } = await supabase.from('jobs').select('id, title').eq('status', 'Active').eq('type', 'blue');
    console.log(`\nNo search (all blue jobs): ${allBlue ? allBlue.length : 0} results`);
}

liveTest();
