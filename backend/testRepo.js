require('dotenv').config();
const jobRepository = require('./src/repositories/jobRepository');

async function testRepository() {
    try {
        console.log("Calling getNearbyJobs with searchWords=['tap']");
        const data = await jobRepository.getNearbyJobs(31.5, 74.3, 50, ['tap']);
        console.log("Success! Data:", data.length);
    } catch (err) {
        console.error("Crash Caught:", err);
    }
}
testRepository();
