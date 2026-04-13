require('dotenv').config();
const { matchJobs } = require('./src/services/matchingService');
const { getNearbyJobs } = require('./src/repositories/jobRepository');

async function testQuery() {
    try {
        console.log("=== Testing Supabase Queries ===");
        const searchWords = ["electrician"];
        
        console.log("\nTesting getNearbyJobs(lat, lng, radius, searchWords)...");
        try {
            const nearby = await getNearbyJobs(31.0, 74.0, 10, searchWords);
            console.log("Nearby returned", nearby.length);
        } catch (e) {
            console.error("Nearby Error:", e.message);
        }

        console.log("\nTesting matchJobs(profile, jobType, searchWords)...");
        try {
            const profile = { location: 'Lahore', skills: 'electrician' };
            const matched = await matchJobs(profile, 'blue', searchWords);
            console.log("Matched returned", matched.length);
        } catch (e) {
            console.error("MatchJobs Error:", e.message);
        }

    } catch (err) {
        console.error("Test Script Error:", err);
    }
}

testQuery();
