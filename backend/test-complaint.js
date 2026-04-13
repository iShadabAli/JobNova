require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function testComplaint() {
    try {
        console.log("Fetching a random user to act as reporter...");
        const { data: users, error: userError } = await supabaseAdmin.from('users').select('id').limit(1);
        
        if (userError || !users.length) {
            console.error("Could not fetch user:", userError);
            return;
        }
        
        const reporterId = users[0].id;
        console.log(`Using reporter ID: ${reporterId}`);

        console.log("Attempting to insert a complaint...");
        const payload = {
            reporter_id: reporterId,
            reported_user_id: null,
            reported_job_id: null,
            reason: "bug",
            description: "This is a test complaint description.",
            status: "pending"
        };
        
        console.log("Payload:", payload);

        const { data, error } = await supabaseAdmin
            .from('complaints')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error("SUPABASE ERROR:");
            console.error(error);
        } else {
            console.log("SUCCESS:", data);
        }
    } catch (err) {
        console.error("RUNTIME ERROR:", err);
    }
}

testComplaint();
