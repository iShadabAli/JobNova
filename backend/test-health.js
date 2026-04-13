async function testEndpoint() {
    try {
        const res = await fetch('http://localhost:5000/api/health');
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response Text:", text);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
testEndpoint();
