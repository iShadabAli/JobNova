const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');

// GET /api/bookings/workers — Browse blue-collar workers for booking
router.get('/workers', authenticateUser, async (req, res) => {
    const { search } = req.query;

    try {
        // Get all blue-collar users
        const { data: users, error: usersErr } = await supabaseAdmin
            .from('users')
            .select('id, first_name, last_name, phone')
            .eq('role', 'blue_collar');

        if (usersErr) throw usersErr;
        if (!users || users.length === 0) return res.json({ success: true, data: [] });

        const userIds = users.map(u => u.id);

        // Get their profiles
        const { data: profiles, error: profErr } = await supabaseAdmin
            .from('profiles')
            .select('user_id, full_name, trade, skills, location, hourly_rate, availability, avatar_url, avg_rating, total_reviews')
            .in('user_id', userIds);

        if (profErr) throw profErr;

        const profileMap = {};
        if (profiles) profiles.forEach(p => profileMap[p.user_id] = p);

        let results = users.map(u => ({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            phone: u.phone,
            ...profileMap[u.id]
        }));

        // Filter by search term
        if (search && search.trim()) {
            const q = search.toLowerCase();
            results = results.filter(w =>
                (w.full_name && w.full_name.toLowerCase().includes(q)) ||
                (w.trade && w.trade.toLowerCase().includes(q)) ||
                (w.skills && w.skills.toLowerCase().includes(q)) ||
                (w.location && w.location.toLowerCase().includes(q)) ||
                (w.first_name && w.first_name.toLowerCase().includes(q))
            );
        }

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching workers:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/bookings — Employer creates a booking
router.post('/', authenticateUser, async (req, res) => {
    const employer_id = req.user.id;
    const { worker_id, title, description, location, booking_date, start_time, end_time, offered_rate } = req.body;

    if (!worker_id || !title || !booking_date || !start_time || !end_time) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        // Check for overlapping bookings (Pending or Accepted)
        const { data: activeBookings } = await supabaseAdmin
            .from('bookings')
            .select('start_time, end_time')
            .eq('worker_id', worker_id)
            .eq('booking_date', booking_date)
            .in('status', ['Pending', 'Accepted']);

        const overlapping = activeBookings?.filter(b => {
            return start_time < b.end_time && end_time > b.start_time;
        });

        if (overlapping && overlapping.length > 0) {
            const slots = overlapping.map(b => `${b.start_time.slice(0,5)} to ${b.end_time.slice(0,5)}`).join(', ');
            return res.status(400).json({ success: false, error: `Worker is already booked during overlapping hours: ${slots}` });
        }

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .insert([{
                employer_id,
                worker_id,
                title,
                description: description || '',
                location: location || '',
                booking_date,
                start_time,
                end_time,
                offered_rate: offered_rate || '',
                status: 'Pending'
            }])
            .select();

        if (error) throw error;

        // Notify the worker
        try {
            const { data: employer } = await supabaseAdmin
                .from('users')
                .select('first_name, last_name')
                .eq('id', employer_id)
                .single();

            await notificationService.createNotification(
                worker_id,
                'BOOKING_REQUEST',
                `${employer?.first_name || 'An employer'} wants to book you for "${title}" on ${booking_date}.`,
                data[0].id
            );
        } catch (notifyErr) {
            console.error('Booking notification failed:', notifyErr);
        }

        res.json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/bookings/employer — Get all bookings made by this employer
router.get('/employer', authenticateUser, async (req, res) => {
    const employer_id = req.user.id;

    try {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('employer_id', employer_id)
            .order('booking_date', { ascending: true });

        if (error) throw error;

        // Attach worker info
        if (data && data.length > 0) {
            const workerIds = [...new Set(data.map(b => b.worker_id))];
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('user_id, full_name, trade, avatar_url, location')
                .in('user_id', workerIds);

            const profMap = {};
            if (profiles) profiles.forEach(p => profMap[p.user_id] = p);
            data.forEach(b => { b.worker = profMap[b.worker_id] || {}; });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching employer bookings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/bookings/worker — Get all bookings for this worker
router.get('/worker', authenticateUser, async (req, res) => {
    const worker_id = req.user.id;

    try {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('worker_id', worker_id)
            .order('booking_date', { ascending: true });

        if (error) throw error;

        // Attach employer info
        if (data && data.length > 0) {
            const empIds = [...new Set(data.map(b => b.employer_id))];
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('user_id, full_name, company_name, avatar_url')
                .in('user_id', empIds);

            const { data: users } = await supabaseAdmin
                .from('users')
                .select('id, first_name, last_name')
                .in('id', empIds);

            const profMap = {};
            if (profiles) profiles.forEach(p => profMap[p.user_id] = p);
            const userMap = {};
            if (users) users.forEach(u => userMap[u.id] = u);

            data.forEach(b => {
                b.employer = {
                    ...(profMap[b.employer_id] || {}),
                    ...(userMap[b.employer_id] || {})
                };
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching worker bookings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/bookings/:id/status — Update booking status
router.patch('/:id/status', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['Accepted', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update({ status, updated_at: new Date() })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Send notification to the other party
        try {
            const booking = data[0];
            const { data: actor } = await supabaseAdmin
                .from('users')
                .select('first_name')
                .eq('id', userId)
                .single();

            const actorName = actor?.first_name || 'Someone';
            const targetId = userId === booking.employer_id ? booking.worker_id : booking.employer_id;

            let message = '';
            if (status === 'Accepted') message = `${actorName} accepted your booking for "${booking.title}"!`;
            else if (status === 'Rejected') message = `${actorName} declined your booking for "${booking.title}".`;
            else if (status === 'Completed') message = `Booking "${booking.title}" has been marked as completed.`;
            else if (status === 'Cancelled') message = `${actorName} cancelled the booking for "${booking.title}".`;

            await notificationService.createNotification(targetId, 'BOOKING_UPDATE', message, id);
        } catch (notifyErr) {
            console.error('Booking status notification failed:', notifyErr);
        }

        res.json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
