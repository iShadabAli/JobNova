const notificationService = require('../services/notificationService');
const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/authMiddleware');

// Create a travel announcement
router.post('/', async (req, res) => {
    const { user_id, from_city, to_city, travel_date_start, travel_date_end, available_for_work, skills } = req.body;

    if (!user_id || !from_city || !to_city || !travel_date_start || !travel_date_end) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('time_exchanges')
            .insert([{
                user_id,
                from_city,
                to_city,
                travel_date_start,
                travel_date_end,
                available_for_work,
                skills
            }])
            .select();

        if (error) throw error;
        
        // Notify the user (Confirmation)
        await notificationService.createNotification(
            user_id,
            'TE_ANNOUNCEMENT_CREATED',
            `Your travel announcement from ${from_city} to ${to_city} has been posted successfully!`,
            data[0].id
        );
        res.json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error creating time exchange:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all travel announcements with optional filters
router.get('/', async (req, res) => {
    const { to_city, date } = req.query;

    try {
        let query = supabaseAdmin
            .from('time_exchanges')
            .select('*')
            .order('created_at', { ascending: false });

        if (to_city) {
            query = query.ilike('to_city', `%${to_city}%`);
        }

        if (date) {
            query = query.lte('travel_date_start', date).gte('travel_date_end', date);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Manually fetch profiles and users for all user_ids
        if (data && data.length > 0) {
            const userIds = [...new Set(data.map(t => t.user_id).filter(Boolean))];
            if (userIds.length > 0) {
                const { data: profilesData } = await supabaseAdmin
                    .from('profiles')
                    .select('user_id, full_name, avatar_url, skills')
                    .in('user_id', userIds);
                
                const { data: usersData } = await supabaseAdmin
                    .from('users')
                    .select('id, role, first_name, last_name')
                    .in('id', userIds);

                const profileMap = {};
                if (profilesData) profilesData.forEach(p => profileMap[p.user_id] = p);
                
                const userMap = {};
                if (usersData) usersData.forEach(u => userMap[u.id] = u);

                data.forEach(item => {
                    const prof = profileMap[item.user_id] || {};
                    const usr = userMap[item.user_id] || {};
                    item.user = {
                        user_id: item.user_id,
                        full_name: prof.full_name || (usr.first_name ? `${usr.first_name} ${usr.last_name}` : 'Unknown'),
                        profile_picture: prof.avatar_url,
                        role: usr.role,
                        skills: prof.skills
                    };
                    // Use profile skills if time exchange skills are empty
                    if (!item.skills && prof.skills) {
                        item.skills = prof.skills;
                    }
                });
            }
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching time exchanges:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get announcements for a specific user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from('time_exchanges')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching user time exchanges:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete an announcement
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabaseAdmin
            .from('time_exchanges')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        console.error('Error deleting time exchange:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- TIME EXCHANGE HIRING ROUTES ---

// POST /api/time-exchange/hire — Employer sends a hire request to a traveler
router.post('/hire', authenticateUser, async (req, res) => {
    const { worker_id, time_exchange_id, message } = req.body;
    const employer_id = req.user.id;

    if (!employer_id || !worker_id || !time_exchange_id) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        // Check if a request already exists
        const { data: existing } = await supabaseAdmin
            .from('time_exchange_requests')
            .select('*')
            .eq('employer_id', employer_id)
            .eq('worker_id', worker_id)
            .eq('time_exchange_id', time_exchange_id)
            .single();

        if (existing) {
            return res.status(400).json({ success: false, error: 'You have already sent a request to this traveler' });
        }

        const { data, error } = await supabaseAdmin
            .from('time_exchange_requests')
            .insert([{ employer_id, worker_id, time_exchange_id, message, status: 'Pending' }])
            .select();

        if (error) throw error;

        // Notify the worker
        try {
            const { data: employer } = await supabaseAdmin.from('users').select('first_name, last_name').eq('id', employer_id).single();
            await notificationService.createNotification(
                worker_id,
                'TE_HIRE_REQUEST',
                `${employer?.first_name || 'An employer'} sent you a hire request for your travel announcement!`,
                data[0].id
            );
        } catch (notifyErr) { console.error('Notification failed:', notifyErr); }

        res.json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error sending TE hire request:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/time-exchange/requests/:worker_id — Worker fetches their incoming requests
router.get('/requests/:worker_id', async (req, res) => {
    const { worker_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from('time_exchange_requests')
            .select(`
                *,
                employer:employer_id (id, first_name, last_name),
                travel:time_exchange_id (*)
            `)
            .eq('worker_id', worker_id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching TE requests:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/time-exchange/requests/:id/status — Worker accepts or rejects
router.patch('/requests/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('time_exchange_requests')
            .update({ status, updated_at: new Date() })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Notify the employer
        try {
            const { data: reqData } = await supabaseAdmin.from('time_exchange_requests').select('employer_id, worker_id').eq('id', id).single();
            const { data: worker } = await supabaseAdmin.from('users').select('first_name, last_name').eq('id', reqData.worker_id).single();
            
            await notificationService.createNotification(
                reqData.employer_id,
                'TE_REQUEST_RESPONSE',
                `${worker?.first_name || 'A worker'} has ${status.toLowerCase()} your Time Exchange hire request.`,
                id
            );
        } catch (notifyErr) { console.error('Notification failed:', notifyErr); }

        res.json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error updating TE request status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
