const axios = require('axios');

async function testApi() {
    try {
        // Login as Asad
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'asad@gmail.com',
            password: 'asad'
        });
        const token = loginRes.data.data.token;
        console.log("Logged in Asad. Token starts with:", token.substring(0, 10));

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log("\n--- Testing /api/jobs/match ---");
        const matchEmpty = await axios.get('http://localhost:5000/api/jobs/match?type=blue', config);
        console.log("Empty search returned", matchEmpty.data.length, "jobs");
        if(matchEmpty.data.length > 0) console.log("   -> Titles:", matchEmpty.data.map(j => j.title).join(', '));

        const matchTap = await axios.get('http://localhost:5000/api/jobs/match?type=blue&search=tap', config);
        console.log("'tap' search returned", matchTap.data.length, "jobs");
        if(matchTap.data.length > 0) console.log("   -> Titles:", matchTap.data.map(j => j.title).join(', '));

        const matchCar = await axios.get('http://localhost:5000/api/jobs/match?type=blue&search=car%20mechanic', config);
        console.log("'car mechanic' search returned", matchCar.data.length, "jobs");
        if(matchCar.data.length > 0) console.log("   -> Titles:", matchCar.data.map(j => j.title).join(', '));

        console.log("\n--- Testing /api/jobs/nearby ---");
        // Using Lat/Lng of Lahore
        const nearbyEmpty = await axios.get('http://localhost:5000/api/jobs/nearby?lat=31.5&lng=74.3&radius=50', config);
        console.log("Empty nearby returned", nearbyEmpty.data.length, "jobs");
        if(nearbyEmpty.data.length > 0) console.log("   -> Titles:", nearbyEmpty.data.map(j => j.title).join(', '));

        const nearbyTap = await axios.get('http://localhost:5000/api/jobs/nearby?lat=31.5&lng=74.3&radius=50&search=tap', config);
        console.log("'tap' nearby returned", nearbyTap.data.length, "jobs");
        if(nearbyTap.data.length > 0) console.log("   -> Titles:", nearbyTap.data.map(j => j.title).join(', '));

        const nearbyCar = await axios.get('http://localhost:5000/api/jobs/nearby?lat=31.5&lng=74.3&radius=50&search=car%20mechanic', config);
        console.log("'car mechanic' nearby returned", nearbyCar.data.length, "jobs");
        if(nearbyCar.data.length > 0) console.log("   -> Titles:", nearbyCar.data.map(j => j.title).join(', '));

    } catch (e) {
        console.error("API Error:", e.response?.data || e.message);
    }
}
testApi();
