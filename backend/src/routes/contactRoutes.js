const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// POST /api/contact - Submit a contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const { data, error } = await supabase
            .from('contact_messages')
            .insert([
                { name, email, phone, message }
            ])
            .select();

        if (error) {
            console.error('Error inserting contact message:', error);
            // If table doesn't exist yet, we can catch it
            if (error.code === '42P01') {
                 return res.status(500).json({ error: 'Database table not set up yet.' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Message sent successfully', data });

    } catch (error) {
        console.error('Contact API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/contact - Get all messages (Admin only, later we can add auth middleware)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Fetch Contacts Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
