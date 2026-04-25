const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../config/supabase');
const notificationService = require('../services/notificationService');


// GET /api/international-jobs — Fetch all active international jobs (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { country, type } = req.query;

        let query = supabase
            .from('international_jobs')
            .select(`
                *,
                employer:employer_id (
                    id, first_name, last_name
                )
            `)
            .eq('status', 'Active')
            .order('created_at', { ascending: false });

        if (country) {
            query = query.ilike('country', `%${country}%`);
        }
        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching international jobs:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/international-jobs — Employer creates a new international job
router.post('/', async (req, res) => {
    try {
        const { employer_id, title, description, country, city, salary, currency, visa_sponsored, type, requirements, benefits } = req.body;

        if (!employer_id || !title || !country || !type) {
            return res.status(400).json({ success: false, error: 'Title, country, and type are required' });
        }

        const { data, error } = await supabase
            .from('international_jobs')
            .insert([{
                employer_id,
                title,
                description,
                country,
                city,
                salary,
                currency: currency || 'USD',
                visa_sponsored: visa_sponsored || false,
                type,
                requirements,
                benefits
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        res.status(201).json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error creating international job:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal server error', details: error });
    }
});

// DELETE /api/international-jobs/:id — Employer deletes their own listing
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('international_jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'International job deleted' });
    } catch (error) {
        console.error('Error deleting international job:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/international-jobs/:id/apply — Worker applies for an international job
router.post('/:id/apply', async (req, res) => {
    try {
        const { id } = req.params;
        const { applicant_id } = req.body; 
        
        
        if (!applicant_id) {
                        return res.status(400).json({ success: false, error: 'Applicant ID is required' });
        }

        const { data, error } = await supabase
            .from('international_job_applications')
            .insert([{ job_id: id, applicant_id }])
            .select();

        if (error) {
                        if (error.code === '23505') {
                return res.status(400).json({ success: false, error: 'You have already applied for this job' });
            }
            throw error;
        }

                // Notify the employer
        try {
            const { data: job } = await supabase.from('international_jobs').select('employer_id, title').eq('id', id).single();
            if (job) {
                await notificationService.createNotification(
                    job.employer_id,
                    'NEW_INTL_APPLICANT',
                    `New applicant for international job: ${job.title}`,
                    id
                );
            }
        } catch (notifyErr) { console.error('Notification failed:', notifyErr); }

        res.status(201).json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error applying for international job:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal server error', details: error });
    }
});

// GET /api/international-jobs/employer/:employer_id — Fetch employer's active international jobs
router.get('/employer/:employer_id', async (req, res) => {
    try {
        const { employer_id } = req.params;

        const { data, error } = await supabase
            .from('international_jobs')
            .select('*')
            .eq('employer_id', employer_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching employer international jobs:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/international-jobs/:id/applications — Fetch all applicants for a specific job
router.get('/:id/applications', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: apps, error } = await supabase
            .from('international_job_applications')
            .select('*')
            .eq('job_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch profile info for each applicant
        const mappedData = await Promise.all(apps.map(async (app) => {
            const { data: user } = await supabase
                .from('users')
                .select('id, first_name, last_name, phone')
                .eq('id', app.applicant_id)
                .single();

            const { data: profile } = await supabase
                .from('profiles')
                .select('user_id, full_name, experience, avg_rating, total_reviews')
                .eq('user_id', app.applicant_id)
                .single();

            const fallbackName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Candidate';
            
            return {
                id: app.id,
                status: app.status,
                applied_at: app.created_at,
                applicant_id: app.applicant_id,
                applicant_name: profile?.full_name || fallbackName,
                applicant_profile: profile || {},
                applicant_user: user || {}
            };
        }));

        res.json({ success: true, data: mappedData });
    } catch (error) {
        console.error('Error fetching international job applications:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/international-jobs/applications/:appId/status — Update application status
router.put('/applications/:appId/status', async (req, res) => {
    try {
        const { appId } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('international_job_applications')
            .update({ status })
            .eq('id', appId)
            .select();

        if (error) throw error;

        
        // Notify the applicant
        try {
            const { data: appData } = await supabase.from('international_job_applications').select('applicant_id, job_id, status').eq('id', appId).single();
            if (appData) {
                const { data: job } = await supabase.from('international_jobs').select('title').eq('id', appData.job_id).single();
                await notificationService.createNotification(
                    appData.applicant_id,
                    'INTL_STATUS_UPDATE',
                    `Your application status for "${job?.title || 'International Job'}" has been updated to ${status}`,
                    appData.job_id
                );
            }
        } catch (notifyErr) { console.error('Notification failed:', notifyErr); }
        res.json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
