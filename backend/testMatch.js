require('dotenv').config();
const { supabase } = require('./src/config/supabase');
const { matchJobs } = require('./src/services/matchingService');

async function run() {
    try {
        console.log("Testing Matching Engine...");

        // Mock profile
        const profile = {
            id: 'mock-id',
            role: 'Blue Collar',
            location: 'Lahore',
            skills: 'Plumbing',
            availability: 'Full-time'
        };

        const result = await matchJobs(profile, 'blue');
        console.log("Match Result:", result.length, "jobs found.");
    } catch (e) {
        console.error("Match Failed:", e);
    }
}
run();
