require('dotenv').config();
const { supabase } = require('./src/config/supabase');
const { getSemanticJobTitles } = require('./src/utils/aiSearchMapper');
const jobService = require('./src/services/jobService');

async function testQuery() {
    try {
        console.log("=== Testing AI Search ===");
        const searchInput = "electrician";
        const searchWords = await getSemanticJobTitles(searchInput);
        console.log("Mapped Words:", searchWords);

        console.log("\n=== Testing Supabase OR Query directly ===");
        let query = supabase
            .from('jobs')
            .select('*')
            .eq('status', 'Active')
            .eq('type', 'blue');

        if (searchWords && searchWords.length > 0) {
            const orConditions = searchWords.map(word => `title.ilike.%${word}%`).join(',');
            console.log("Applying orCondition:", orConditions);
            query = query.or(orConditions);
        } else {
            console.log("No search words provided to query.");
        }

        const { data, error } = await query;
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log(`Query returned ${data.length} jobs.`);
            if (data.length > 0) {
                console.log("First job title:", data[0].title);
            }
        }
    } catch (err) {
        console.error("Test Script Error:", err);
    }
}

testQuery();
