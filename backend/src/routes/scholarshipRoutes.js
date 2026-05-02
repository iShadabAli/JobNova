const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/scholarships - Fetch all active scholarships (for users)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scholarships')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching scholarships:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/scholarships/admin - Fetch all scholarships (for admin)
router.get('/admin', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scholarships')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching admin scholarships:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/scholarships - Create a new scholarship (Admin only)
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
    try {
        const { title, provider, description, deadline, application_link } = req.body;

        if (!title || !provider) {
            return res.status(400).json({ error: 'Title and provider are required' });
        }

        const processedDeadline = (deadline && deadline.trim() !== '') ? deadline : null;
        const processedLink = (application_link && application_link.trim() !== '') ? application_link : null;

        const { data, error } = await supabase
            .from('scholarships')
            .insert([{ 
                title, 
                provider, 
                description, 
                deadline: processedDeadline, 
                application_link: processedLink 
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Scholarship created successfully', data: data[0] });
    } catch (error) {
        console.error('Error creating scholarship:', error);
        res.status(500).json({ error: error.message || 'Internal server error', details: error });
    }
});

// DELETE /api/scholarships/:id - Delete a scholarship
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('scholarships')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Scholarship deleted successfully' });
    } catch (error) {
        console.error('Error deleting scholarship:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/scholarships/:id/apply - Apply for an internal scholarship
router.post('/:id/apply', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if scholarship exists and is active
        const { data: scholarship, error: schError } = await supabase
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .single();

        if (schError || !scholarship) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }

        if (!scholarship.is_active) {
            return res.status(400).json({ error: 'This scholarship is no longer active' });
        }

        // Apply
        const { data, error } = await supabase
            .from('scholarship_applications')
            .insert([{ scholarship_id: id, applicant_id: userId }])
            .select();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ error: 'You have already applied for this scholarship' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Applied successfully', data: data[0] });
    } catch (error) {
        console.error('Error applying for scholarship:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/scholarships/my-applications - Get user's scholarship applications
router.get('/my-applications', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('scholarship_applications')
            .select('*, scholarships(*)')
            .eq('applicant_id', userId)
            .order('applied_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching my applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/scholarships/:id/applicants - Get applicants for a specific scholarship (Admin)
router.get('/:id/applicants', async (req, res) => {
    try {
        const { id } = req.params;
        // Using service role to bypass RLS and fetch users data directly from profiles or auth
        // Since profiles table contains user details:
        const { data, error } = await supabase
            .from('scholarship_applications')
            .select('*, profiles!applicant_id(*)')
            .eq('scholarship_id', id)
            .order('applied_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
