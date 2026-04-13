require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function test() {
    // Test with "tap" and "fix" which match "Fixing Tap"
    let q1 = supabase.from('jobs').select('id, title').eq('status', 'Active').eq('type', 'blue')
        .or('title.ilike.%tap%,title.ilike.%fix%');
    const { data: d1 } = await q1;
    console.log('Search "tap" or "fix":', d1.length, 'results');
    d1.forEach(j => console.log('  -', j.title));

    // Test with "truck" which matches "Truck Machanic"
    let q2 = supabase.from('jobs').select('id, title').eq('status', 'Active').eq('type', 'blue')
        .or('title.ilike.%truck%');
    const { data: d2 } = await q2;
    console.log('\nSearch "truck":', d2.length, 'results');
    d2.forEach(j => console.log('  -', j.title));

    // Test with "machanic" (typo version) 
    let q3 = supabase.from('jobs').select('id, title').eq('status', 'Active').eq('type', 'blue')
        .or('title.ilike.%machanic%');
    const { data: d3 } = await q3;
    console.log('\nSearch "machanic":', d3.length, 'results');
    d3.forEach(j => console.log('  -', j.title));

    // Test "mechanic" (correct spelling - should return 0 since DB has "Machanic")
    let q4 = supabase.from('jobs').select('id, title').eq('status', 'Active').eq('type', 'blue')
        .or('title.ilike.%mechanic%');
    const { data: d4 } = await q4;
    console.log('\nSearch "mechanic" (correct spelling):', d4.length, 'results');
    d4.forEach(j => console.log('  -', j.title));
}

test();
