require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function alterTable() {
    try {
        console.log("Connecting to Supabase...");
        console.log("Creating migration script instead...");
    } catch (e) {
        console.error(e);
    }
}

alterTable();
