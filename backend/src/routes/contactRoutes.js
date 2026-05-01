const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../config/supabase');

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
            return res.status(500).json({ error: 'Failed to submit message' });
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

// PUT /api/contact/:id/status - Update message status (Admin only)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expects 'Unread', 'Read', or 'Resolved'

        if (!['Unread', 'Read', 'Resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const { data, error } = await supabase
            .from('contact_messages')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message: 'Status updated successfully', data: data[0] });
    } catch (error) {
        console.error('Update Contact Status Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
